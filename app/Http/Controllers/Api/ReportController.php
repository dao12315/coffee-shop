<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    // Tổng quan tháng hiện tại
    public function summary(Request $request)
    {
        $now   = Carbon::now();
        $rev   = DB::table('orders')
            ->where('status', 'completed')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('total');

        $count = DB::table('orders')
            ->where('status', 'completed')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        $avg   = $count > 0 ? round($rev / $count, 0) : 0;

        return response()->json([
            'revenue_this_month' => (int)$rev,
            'avg_order_value'    => (int)$avg,
            // nếu có dữ liệu cost bạn có thể trả thêm profit tại đây
        ]);
    }

    // Doanh thu 12 tháng gần nhất
    public function monthly(Request $request)
    {
        $now = Carbon::now()->startOfMonth();
        // mảng 12 tháng mặc định = 0
        $labels = [];
        $data   = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = (clone $now)->subMonthsNoOverflow($i);
            $labels[] = $m->format('m/Y');
            $data[$m->format('Y-m')] = 0;
        }

        $rows = DB::table('orders')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') ym, SUM(total) sum_total")
            ->where('status', 'completed')
            ->where('created_at', '>=', (clone $now)->subMonthsNoOverflow(11))
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        foreach ($rows as $r) {
            if (isset($data[$r->ym])) $data[$r->ym] = (int)$r->sum_total;
        }

        return response()->json([
            'labels' => $labels,
            'data'   => array_values($data),
        ]);
    }

    // Tỉ trọng doanh thu theo danh mục (all time hoặc bạn tự lọc khoảng thời gian)
    public function categoryShare(Request $request)
    {
        $rows = DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->join('products as p', 'p.id', '=', 'oi.product_id')
            ->join('categories as c', 'c.id', '=', 'p.category_id')
            ->where('o.status', 'completed')
            ->selectRaw('c.name as category, SUM(oi.quantity * oi.price) as revenue')
            ->groupBy('c.name')
            ->orderByDesc('revenue')
            ->get();

        return response()->json([
            'labels' => $rows->pluck('category'),
            'data'   => $rows->pluck('revenue')->map(fn($v)=>(int)$v),
        ]);
    }

    protected function buildDataset($from, $to) {
        $q = DB::table('orders')->whereBetween('created_at', [$from, $to]);

        $revenue = (clone $q)->where('status','completed')->sum('total');
        $orderCount = (clone $q)->count();
        $avgOrder = $orderCount ? round($revenue / $orderCount) : 0;

        // doanh thu theo tháng (yyyy-mm -> sum)
        $monthly = (clone $q)->where('status','completed')
            ->selectRaw("DATE_FORMAT(created_at,'%Y-%m') as ym, SUM(total) as revenue")
            ->groupBy('ym')->orderBy('ym')->get();

        // tỉ trọng theo danh mục
        $categoryShare = DB::table('order_items as oi')
            ->join('orders as o','o.id','=','oi.order_id')
            ->join('products as p','p.id','=','oi.product_id')
            ->join('categories as c','c.id','=','p.category_id')
            ->whereBetween('o.created_at', [$from,$to])
            ->where('o.status','completed')
            ->selectRaw('c.name, SUM(oi.quantity*oi.price) as amount')
            ->groupBy('c.name')->orderByDesc('amount')->get();

        return compact('revenue','orderCount','avgOrder','monthly','categoryShare','from','to');
    }

    public function export(Request $r) {
        $r->validate([
            'from' => 'required|date',
            'to'   => 'required|date',
            'fmt'  => 'nullable|in:csv,xlsx,pdf'
        ]);
        $fmt  = $r->get('fmt','csv');
        $from = Carbon::parse($r->from)->startOfDay();
        $to   = Carbon::parse($r->to)->endOfDay();

        $data = $this->buildDataset($from, $to);

        if ($fmt === 'csv')   return $this->exportCsv($data);
        if ($fmt === 'xlsx')  return $this->exportCsv($data, true);   // Excel nhẹ: CSV mở bằng Excel
        if ($fmt === 'pdf')   return $this->exportPdf($data);

        abort(400, 'Unsupported format');
    }

    protected function exportCsv($data, $asExcel=false): StreamedResponse {
        $filename = 'report_'.now()->format('Ymd_His').($asExcel?'.xlsx':'.csv');
        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        return response()->streamDownload(function () use ($data) {
            $out = fopen('php://output','w');
            // BOM cho Excel hiển thị tiếng Việt
            fwrite($out, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($out, ['BÁO CÁO DOANH THU']);
            fputcsv($out, ['Từ', $data['from'], 'Đến', $data['to']]);
            fputcsv($out, []);
            fputcsv($out, ['Chỉ số','Giá trị']);
            fputcsv($out, ['Doanh thu', $data['revenue']]);
            fputcsv($out, ['Số đơn', $data['orderCount']]);
            fputcsv($out, ['Giá trị đơn TB', $data['avgOrder']]);
            fputcsv($out, []);

            fputcsv($out, ['Doanh thu theo tháng']);
            fputcsv($out, ['Tháng','Doanh thu']);
            foreach ($data['monthly'] as $row) {
                fputcsv($out, [$row->ym, $row->revenue]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Tỉ trọng theo danh mục']);
            fputcsv($out, ['Danh mục','Giá trị']);
            foreach ($data['categoryShare'] as $row) {
                fputcsv($out, [$row->name, $row->amount]);
            }
            fclose($out);
        }, $filename, $headers);
    }

    protected function exportPdf($data) {
        // Cách nhẹ: render Blade rồi in ra PDF bằng dompdf (barryvdh)
        // composer require barryvdh/laravel-dompdf
        // php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
        $pdf = \PDF::loadView('reports.pdf', $data)->setPaper('a4', 'portrait');
        return $pdf->download('report_'.now()->format('Ymd_His').'.pdf');
    }
}
