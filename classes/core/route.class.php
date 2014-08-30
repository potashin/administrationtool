<?php

namespace Classes\Core;

class Route
{
	static function start(){
		$routes = explode('/', $_SERVER['REQUEST_URI']);

		foreach ($routes as $key => $value) {
			if (empty($routes[$key])) {
				unset($routes[$key]);
			}
		}

		$routes = array_values($routes);

		if (isset($_POST['data']) && !empty($_POST['data'])) {
			if (!$data = json_decode($_POST['data'], true)) {
				throw new \Exception('Error occured while decoding.Error code : ' . json_last_error());
			}
		}

		$model_type = empty($routes) ? 'Main' : array_shift($routes);

		$model_meth = empty($routes) ? 'get' : array_shift($routes);

		for ($i = 0; $i < count($routes) - 1; $i++){
			$model_args[$routes[$i]] = $routes[++$i];
		}

		$model_args = isset($model_args) ? array_change_key_case($model_args , CASE_UPPER) : null;

		$model_data = empty($data) ? null : $data;


		$controller = new \Classes\Controller\Controller($model_type, $model_meth);
		$controller->action($model_meth, $model_args , $model_data);
	}
}