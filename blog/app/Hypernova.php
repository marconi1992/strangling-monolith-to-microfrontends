<?php

namespace App;

use Ramsey\Uuid\Uuid;
use WF\Hypernova\Renderer as HypernovaRenderer;

class Hypernova
{
    protected $renderer;

    protected $jobs = [];

    public function __construct(HypernovaRenderer $renderer)
    {
        $this->renderer = $renderer;
    }

    public function pushJob($component, $data)
    {
        $component = $component ?? "";
        $data = $data ?? new \stdClass();

        if (empty($component)) {
            throw new \InvalidArgumentException("The component name can not be empty");
        }

        $uuid = $this->addJob($component, $data);
        return $this->renderPlaceholder($uuid);
    }

    public function addJob($component, $data = [])
    {
        $uuid = Uuid::uuid1()->toString();
        $job = [
            'name' => $component,
            'data' => $data
        ];

        $this->jobs[$uuid] = $job;

        return $uuid;
    }

    public function getJob($uuid)
    {
        return array_get($this->jobs, $uuid);
    }

    public function getJobs()
    {
        return $this->jobs;
    }

    public function setJobs($jobs)
    {
        $this->jobs = $jobs;
        return $this;
    }

    public function clearJobs()
    {
        return $this->setJobs([]);
    }

    public function renderPlaceholder($uuid, $job = null)
    {
        $job = !$job ? $this->getJob($uuid):$job;
        if (!$job) {
            return '';
        }

        $component = $job['name'];
        $data = $job['data'];
        $json = json_encode($data);

        $attributes = 'data-hypernova-key="'.$component.'" data-hypernova-id="'.$uuid.'"';
        return (
            $this->getStartComment($uuid).
            '<div '.$attributes.'></div>'.
            '<script type="application/json" '.$attributes.'><!--'.$json.'--></script>'.
            $this->getEndComment($uuid)
        );
    }

    public function modifyResponse($response)
    {
        if (!empty($this->jobs)) {
            $content = $response->getContent();
            $content = $this->replaceContents($content);
            $response->setContent($content);
        }
        return $response;
    }

    protected function getStartComment($uuid)
    {
        return '<!-- START hypernova['.$uuid.'] -->';
    }

    protected function getEndComment($uuid)
    {
        return '<!-- END hypernova['.$uuid.'] -->';
    }

    protected function renderJobs($jobs)
    {
        $renderer = $this->renderer;
        foreach ($jobs as $uuid => $job) {
            $renderer->addJob($uuid, $job);
        }

        return $renderer->render();
    }

    protected function replaceContents($contents)
    {
        $response = $this->renderJobs($this->jobs);
        foreach ($response->results as $uuid => $jobResult) {
            if ($jobResult->success) {
                $start = preg_quote($this->getStartComment($uuid), '/');
                $end = preg_quote($this->getEndComment($uuid), '/');
                $contents = preg_replace('/'.$start.'(.*?)'.$end.'/', $jobResult->html, $contents);
            }
        }
        return $contents;
    }
}
