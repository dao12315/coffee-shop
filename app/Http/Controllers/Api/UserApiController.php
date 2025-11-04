<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserApiController extends Controller
{
    public function index()
    {
        // Trả về danh sách người dùng (ẩn password)
        return User::query()
            ->select('id','name','email','phone','role','created_at')
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'phone'    => ['nullable','string','max:50'],
            'role'     => ['required', Rule::in(['admin','manager','staff'])],
            'password' => ['required','string','min:6'],
        ]);

        $u = new User();
        $u->name  = $data['name'];
        $u->email = $data['email'];
        $u->phone = $data['phone'] ?? null;
        $u->role  = $data['role'];
        $u->password = Hash::make($data['password']);
        $u->save();

        return response()->json($u->only('id','name','email','phone','role','created_at'), 201);
    }

    public function show(User $user)
    {
        return $user->only('id','name','email','phone','role','created_at');
    }

    public function update(Request $request, User $user)
    {
        // Không cho tự hạ role của chính mình
        if (Auth::id() === $user->id && $request->filled('role') && $request->role !== $user->role) {
            return response()->json(['message' => 'Không thể thay đổi vai trò của chính bạn.'], 422);
        }

        $data = $request->validate([
            'name'     => ['sometimes','required','string','max:255'],
            'email'    => ['sometimes','required','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'phone'    => ['nullable','string','max:50'],
            'role'     => ['sometimes','required', Rule::in(['admin','manager','staff'])],
            'password' => ['nullable','string','min:6'],
        ]);

        if (array_key_exists('name', $data))  $user->name  = $data['name'];
        if (array_key_exists('email',$data))  $user->email = $data['email'];
        if (array_key_exists('phone',$data))  $user->phone = $data['phone'];
        if (array_key_exists('role', $data))  $user->role  = $data['role'];
        if (!empty($data['password']))        $user->password = Hash::make($data['password']);

        $user->save();

        return $user->only('id','name','email','phone','role','created_at');
    }

    public function destroy(User $user)
    {
        // Chặn tự xoá chính mình
        if (Auth::id() === $user->id) {
            return response()->json(['message' => 'Không thể xoá chính bạn.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Đã xoá tài khoản.']);
    }
}
