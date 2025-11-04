<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h2 { margin: 0 0 10px }
    table { width:100%; border-collapse: collapse; margin: 10px 0 }
    th,td { border:1px solid #ccc; padding:6px; }
  </style>
</head>
<body>
  <h2>BÁO CÁO DOANH THU</h2>
  <p>Khoảng thời gian: {{ $from }} – {{ $to }}</p>

  <table>
    <tr><th>Chỉ số</th><th>Giá trị</th></tr>
    <tr><td>Doanh thu</td><td>{{ number_format($revenue) }} đ</td></tr>
    <tr><td>Số đơn</td><td>{{ $orderCount }}</td></tr>
    <tr><td>Đơn TB</td><td>{{ number_format($avgOrder) }} đ</td></tr>
  </table>

  <h3>Doanh thu theo tháng</h3>
  <table>
    <tr><th>Tháng</th><th>Doanh thu</th></tr>
    @foreach($monthly as $m)
      <tr><td>{{ $m->ym }}</td><td>{{ number_format($m->revenue) }} đ</td></tr>
    @endforeach
  </table>

  <h3>Tỉ trọng theo danh mục</h3>
  <table>
    <tr><th>Danh mục</th><th>Giá trị</th></tr>
    @foreach($categoryShare as $c)
      <tr><td>{{ $c->name }}</td><td>{{ number_format($c->amount) }} đ</td></tr>
    @endforeach
  </table>
</body>
</html>
