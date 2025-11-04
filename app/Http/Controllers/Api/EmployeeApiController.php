<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeApiController extends Controller
{
    public function __construct()
    {
        // CẦN middleware 'auth' + 'role:manager' (đúng với 3 vai trò: manager, employee, customer)
        // Nếu bạn CHƯA khai báo RoleMiddleware thì tạm thời comment dòng dưới:
      //  $this->middleware(['auth', 'role:manager']);
    }

    /**
     * GET /api/employees
     * Hỗ trợ: ?q=...&status=active|inactive&position=staff|manager&per_page=20
     * - Nếu truyền per_page => trả paginate, ngược lại trả mảng phẳng.
     */
    public function index(Request $request)
    {
        $q        = trim((string) $request->query('q', ''));
        $status   = trim((string) $request->query('status', ''));
        $position = trim((string) $request->query('position', ''));
        $perPage  = (int) $request->query('per_page', 0);

        $query = Employee::query()->orderByDesc('id');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%");
            });
        }
        if ($status !== '') {
            $query->where('status', $status);
        }
        if ($position !== '') {
            $query->where('position', $position);
        }

        if ($perPage > 0) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /** GET /api/employees/{employee} */
    public function show(Employee $employee)
    {
        return $employee;
    }

    /** POST /api/employees */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required','max:191'],
            'email'     => ['nullable','email','max:191','unique:employees,email'],
            'phone'     => ['nullable','max:30'],
            'position'  => ['required', Rule::in(['staff','manager'])], // chức danh nội bộ
            'salary'    => ['nullable','numeric','min:0'],
            'status'    => ['required', Rule::in(['active','inactive'])],
            'join_date' => ['nullable','date'],
        ]);

        $data['salary'] = (int)($data['salary'] ?? 0);

        $emp = Employee::create($data);

        return response()->json($emp, 201);
    }

    /** PUT /api/employees/{employee} (hỗ trợ gửi đủ field) 
     *  Nếu muốn PATCH/partial-update, xem phiên bản dưới (updatePartial)
     */
    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'name'      => ['required','max:191'],
            'email'     => ['nullable','email','max:191', Rule::unique('employees','email')->ignore($employee->id)],
            'phone'     => ['nullable','max:30'],
            'position'  => ['required', Rule::in(['staff','manager'])],
            'salary'    => ['nullable','numeric','min:0'],
            'status'    => ['required', Rule::in(['active','inactive'])],
            'join_date' => ['nullable','date'],
        ]);

        $data['salary'] = (int)($data['salary'] ?? 0);

        $employee->update($data);

        return response()->json($employee, 200);
    }

    /** (OPTIONAL) PATCH /api/employees/{employee} – partial update */
    public function updatePartial(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'name'      => ['sometimes','required','max:191'],
            'email'     => ['nullable','email','max:191', Rule::unique('employees','email')->ignore($employee->id)],
            'phone'     => ['nullable','max:30'],
            'position'  => ['sometimes','required', Rule::in(['staff','manager'])],
            'salary'    => ['nullable','numeric','min:0'],
            'status'    => ['sometimes','required', Rule::in(['active','inactive'])],
            'join_date' => ['nullable','date'],
        ]);

        if (array_key_exists('salary', $data)) {
            $data['salary'] = (int)($data['salary'] ?? 0);
        }

        $employee->update($data);

        return response()->json($employee, 200);
    }

    /** DELETE /api/employees/{employee} */
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->noContent(); // 204
    }


    public function toggle(Employee $employee)
{
    $employee->status = $employee->status === 'active' ? 'inactive' : 'active';
    $employee->save();

    return response()->json($employee);
}
}
