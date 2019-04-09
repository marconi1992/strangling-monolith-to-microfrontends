<?php

use Illuminate\Http\Request;
use GuzzleHttp\Client;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/repos', function (Request $req) {
    $q = $req->query('q', 'Laravel');
    $per_page = $req->query('per_page', 8);
    $page = $req->query('page', 1);

    $client = new Client([
        'base_uri' => 'https://api.github.com/'
    ]);

    $query = [
        'q' => $q,
        'per_page' => $per_page,
        'page' => $page
    ];

    $res = $client->get('search/repositories', [
        'query' => array_merge($query , [
            'access_token' => config('services.github.token')
        ])
    ]);

    $contentStr = $res->getBody()->getContents();

    $content = json_decode($contentStr);

    $repos = array_map(function ($repo) {
        return [
            'id' => $repo->id,
            'name' => $repo->name,
            'imageUrl' => $repo->owner->avatar_url ?? null,
            'description' => $repo->description,
            'url' => $repo->html_url
        ];
    }, $content->items ?? []);

    return $repos;
});
