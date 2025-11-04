<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
   public function index(Request $request)
{
    $s = trim($request->get('s',''));
    $q = Employee::query()->orderByDesc('id');

    if ($s !== '') {
        $q->where(function ($x) use ($s) {
            $x->where('name','like',"%$s%")
              ->orWhere('email','like',"%$s%")
              ->orWhere('phone','like',"%$s%");
        });
    }

    $rows = $q->paginate(12)->withQueryString();
    return view('admin.employees.index', compact('rows','s'));
}

    public function create()
    {
        return view('admin.employees.form', ['emp' => new Employee()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required','max:191'],
            'email'     => ['required','email','max:191','unique:employees,email'], // schema của bạn để NOT NULL + unique
            'phone'     => ['nullable','max:30'],
            'position'  => ['required', Rule::in(['staff','manager','admin'])],
            'salary'    => ['nullable','integer','min:0'], // cột là unsignedInteger -> integer
            'status'    => ['required', Rule::in(['active','inactive'])],
            'join_date' => ['nullable','date'],
        ]);

        $data['salary'] = (int)($data['salary'] ?? 0);

        Employee::create($data); // CHỈ tạo 1 lần

        return redirect()->route('admin.employees.index')->with('ok','Đã thêm nhân viên');
    }

    public function edit(Employee $employee)
    {
        return view('admin.employees.form', ['emp' => $employee]);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'name'      => ['required','max:191'],
            'email'     => ['required','email','max:191','unique:employees,email,'.$employee->id],
            'phone'     => ['nullable','max:30'],
            'position'  => ['required', Rule::in(['staff','manager','admin'])],
            'salary'    => ['nullable','integer','min:0'],
            'status'    => ['required', Rule::in(['active','inactive'])],
            'join_date' => ['nullable','date'],
        ]);

        $data['salary'] = (int)($data['salary'] ?? 0);

        $employee->update($data);

        return redirect()->route('admin.employees.index')->with('ok','Đã cập nhật nhân viên');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return back()->with('ok','Đã xoá');
    }

    public function toggle(Employee $employee)
    {
        $employee->status = $employee->status === 'active' ? 'inactive' : 'active';
        $employee->save();
        return back()->with('ok','Đã cập nhật trạng thái');
    }
}
