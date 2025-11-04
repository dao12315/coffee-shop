<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [ /* ... */ ];

    public function boot(): void
    {
        Gate::define('manage-employees', fn($user) => $user->role === 'manager');
        Gate::define('write-product',   fn($user) => in_array($user->role, ['manager','employee']));
        Gate::define('delete-product',  fn($user) => $user->role === 'manager');
    }
}
