@extends('layouts.app') {{-- hoặc bỏ extends nếu bạn chưa có layout --}}
@section('content')
<div style="max-width:640px;margin:80px auto;text-align:center">
  <h1 style="font-size:48px;margin-bottom:8px">403</h1>
  <p>Bạn không có quyền truy cập trang này.</p>
  <a href="{{ route('site.index') }}">Về trang chủ</a>
</div>
@endsection
