<?php
use Illuminate\Http\Request;
use GuzzleHttp\Client;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function (Request $req) {
    $q = $req->query('q', 'Laravel');

    $client = new Client([
        'base_uri' => 'https://api.github.com/'
    ]);

    $query = [
        'q' => $q,
        'per_page' => 8,
        'page' => 1
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

    return view('welcome', [ 'repos' => $repos, 'query' => $query ]);
});
