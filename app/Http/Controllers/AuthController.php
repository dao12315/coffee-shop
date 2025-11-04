<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'identifier' => 'required|string',   // email hoặc phone
            'password'   => 'required|string',
            'remember'   => 'nullable|boolean',
        ]);

        // Tìm theo email hoặc phone
        $user = User::where('email', $data['identifier'])
                    ->orWhere('phone', $data['identifier'])
                    ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Thông tin đăng nhập không đúng.'], 401);
        }

        Auth::login($user, (bool)($data['remember'] ?? false));
        $request->session()->regenerate(); // chống session fixation

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user'    => $user,
        ], 200);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Đã đăng xuất'], 200);
    }

    
    public function register(Request $request)
    {
        $data = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName'  => 'required|string|max:100',
            'email'     => 'nullable|email|unique:users,email',
            'phone'     => 'nullable|string|max:30',
            'password'  => 'required|min:6|confirmed',
        ]);

        if (empty($data['email']) && empty($data['phone'])) {
            return response()->json([
                'message' => 'Cần cung cấp ít nhất email hoặc số điện thoại.'
            ], 422);
        }

        $user = User::create([
            'name'     => trim($data['firstName'].' '.$data['lastName']),
            'email'    => $data['email'] ?? null,
            'phone'    => $data['phone'] ?? null,
            'password' => $data['password'], // hashed nhờ casts
            'role'     => 'customer',
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
        ], 201);
    }
}
