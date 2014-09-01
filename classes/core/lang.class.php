<?php

namespace Classes\Core;


class Lang {

	protected  $lang = array();

	protected function showMessage($key){
		if(isset($this->lang[$key])){
			echo $this->lang[$key];
		} else {
			echo '';
		}
	}

} 