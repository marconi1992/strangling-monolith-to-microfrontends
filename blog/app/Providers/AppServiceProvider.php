<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use WF\Hypernova\Renderer as HypernovaRenderer;
use App\Hypernova;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(HypernovaRenderer::class, function () {
            return new HypernovaRenderer('http://hypernova:3000/batch');
        });

        $this->app->singleton('hypernova', function ($app) {
            return new Hypernova($app->make(HypernovaRenderer::class));
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

        Blade::directive('hypernova', function ($name) {
            return "<?php echo \App\Facades\Hypernova::pushJob($name, $name) ?>";
        });
    }
}
