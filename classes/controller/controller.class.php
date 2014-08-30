<?php

namespace Classes\Controller;

class Controller
{
	private  $model;

	private  $view = null;

	public function __construct ($type, $meth) {
		$namespace = '\Classes\Model\Model_' . $type;
		if (class_exists($namespace)) {
			$this->model = new $namespace();
		}
		if(file_exists('./templates/' . strtolower($type) . '.html')){
			$this->view = new \Classes\View\View($type);
		}
	}

	public function action($model_meth, $model_args = null , $model_data = null){
		if (method_exists($this->model, $model_meth)) {
			if (!empty($this->view)) {
				$data = $this->model->$model_meth($model_args);
				$this->view->generate($data);
			} else {
				if(is_null($model_args)){
					echo $this->model->$model_meth($model_data);
				} else if (is_null($model_data)) {
					echo $this->model->$model_meth($model_args);
				} else {
					echo $this->model->$model_meth($model_args, $model_data);
				}
			}
		} else {
			throw new \Exception('Undefined model method');
		}
	}
}