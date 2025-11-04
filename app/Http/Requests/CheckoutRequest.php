<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{

    public function rules(): array
    {
        return [
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer','exists:products,id'],
            'items.*.qty'        => ['required','integer','min:1'],
            'note'               => ['nullable','string','max:500'],
        ];
    }
}
