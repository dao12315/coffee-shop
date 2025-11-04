<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
use HasFactory ;// , SoftDeletes;

    protected $table = 'employees';
    protected $fillable = [
        'name',       // <- dùng đúng tên cột trong DB
        'email',
        'phone',
        'position',   // staff | manager | admin
        'salary',     // decimal(12,2)
        'status',     // active | inactive
        'join_date',  // date
    ];


   protected $casts = ['join_date'=>'date','salary'=>'integer'];

public function scopeActive($q) { return $q->where('status','active'); }
    public function getSalaryFormattedAttribute(): string
    {
        return number_format((float)$this->salary, 0, ',', '.') . 'đ';
    }
     public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }
}
