<?php

namespace App\Models;
use App\Models\Role;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
/**
 * App\Models\User
 *
 * @method bool hasRole(string $roleName)
 * @method bool hasAnyRole(array $roles)
 * @method bool hasPermission(string $permissionName)
 * @method bool isAdmin()
 * @method bool isManager()
 * @method bool isStaff()
 */

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts for attributes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }
    // Một user có thể có nhiều vai trò (admin, staff, customer...)
public function roles()
{
    return $this->belongsToMany(\App\Models\Role::class, 'user_roles', 'user_id', 'role_id');
}


public function hasRole(string $roleName): bool
{
    return $this->roles()->where('name', $roleName)->exists();
}

public function hasAnyRole(array $roles): bool
{
    return $this->roles()->whereIn('name', $roles)->exists();
}
public function hasPermission(string $permissionName): bool
{
    return $this->roles()
        ->whereHas('permissions', fn($q) => $q->where('name', $permissionName))
        ->exists();
}

// helpers tiện dùng trong Blade/Controller
public function isAdmin(): bool   { return $this->hasRole('admin'); }
public function isManager(): bool { return $this->hasRole('manager'); }
public function isStaff(): bool   { return $this->hasRole('staff'); }


}
