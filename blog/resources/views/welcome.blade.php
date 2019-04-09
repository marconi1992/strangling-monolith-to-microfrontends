@extends('layouts.default')
@section('content')
    <br />
    @hypernova('Home', [ 'items' => $repos, 'query' => $query])
@endsection

