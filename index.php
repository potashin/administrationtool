<?php
    set_include_path(__DIR__);
	include('./config/config.php');

    spl_autoload_extensions('.class.php');
	spl_autoload_register();
	spl_autoload_register(
		function ($class) {
			spl_autoload(strtolower(str_replace("\\", "/", $class)));
		}
	);
	spl_autoload_register(function(){});


    try {
	    \Classes\Core\Route::start();
    } catch (\Exception $error){
        echo $error->getMessage();
    }








