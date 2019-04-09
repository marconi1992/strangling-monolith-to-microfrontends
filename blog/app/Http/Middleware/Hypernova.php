<?php

namespace App\Http\Middleware;

use Closure;
use App\Facades\Hypernova as HypernovaService;

class Hypernova
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        $response = $next($request);

        return HypernovaService::modifyResponse($response);
    }
}
