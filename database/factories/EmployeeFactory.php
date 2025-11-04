<?php

namespace Database\Factories;

use App\Models\Employee;      
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{

      protected $model = Employee::class;
    public function definition(): array
    {
       return [
            'full_name' => $this->faker->name(),
            'email'     => $this->faker->unique()->safeEmail(),
            'phone'     => '09' . $this->faker->numerify('########'),
            'role'      => $this->faker->randomElement(['admin','manager','staff']),
            'salary'    => $this->faker->numberBetween(6_000_000, 25_000_000),
            'is_active' => true,
            'hired_at'  => now()->subDays(rand(1, 1000))->toDateString(),
        ];
    }
}
