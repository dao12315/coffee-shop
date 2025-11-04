@extends('layouts.admin')
@section('title','Nhân viên')

@section('content')
<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold">Nhân viên</h1>

  <div class="flex items-center gap-3">
    <form method="get">
      <input name="s" value="{{ $s }}" placeholder="Tìm kiếm..."
             class="border rounded px-3 py-2" />
    </form>
    <a href="{{ route('admin.employees.create') }}"
       class="px-4 py-2 bg-green-600 text-white rounded">+ Thêm nhân viên</a>
  </div>
</div>

@if(session('ok'))
  <div class="p-3 mb-4 bg-green-100 text-green-800 rounded">{{ session('ok') }}</div>
@endif

<div class="bg-white rounded shadow overflow-x-auto">
  <table class="min-w-full table-auto">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-4 py-2">ID</th>
        <th class="px-4 py-2 text-left">Họ và tên</th>
        <th class="px-4 py-2 text-left">Email</th>
        <th class="px-4 py-2">Số điện thoại</th>
        <th class="px-4 py-2">Chức vụ</th>
        <th class="px-4 py-2">Lương</th>
        <th class="px-4 py-2">Trạng thái</th>
        <th class="px-4 py-2">Ngày vào</th>
        <th class="px-4 py-2 w-48">Thao tác</th>
      </tr>
    </thead>
   <tbody>
  @forelse($rows as $e)
    <tr class="border-t">
      <td class="px-4 py-2">#{{ $e->id }}</td>
      <td class="px-4 py-2 font-medium">{{ $e->name }}</td>
      <td class="px-4 py-2">{{ $e->email }}</td>
      <td class="px-4 py-2">{{ $e->phone }}</td>

      {{-- CỘT CHỨC VỤ --}}
      <td class="px-4 py-2">
        <span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{{ $e->position }}</span>
      </td>

      {{-- CỘT TRẠNG THÁI --}}
      <td class="px-4 py-2">
        @if($e->status === 'active')
          <span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">ĐANG LÀM</span>
        @else
          <span class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">TẠM ẨN</span>
        @endif
      </td>

      {{-- Thao tác ... --}}
      <td class="px-4 py-2">
        <!-- nút Sửa / Xoá / Toggle -->
      </td>
    </tr>
  @empty
    <tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Chưa có nhân viên</td></tr>
  @endforelse
</tbody>

  </table>
</div>

<div class="mt-4">{{ $rows->links() }}</div>
@endsection
