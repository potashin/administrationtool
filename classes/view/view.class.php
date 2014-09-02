<?php

namespace Classes\View;

class View extends \Classes\Core\Lang
{

	private $content;

	public function __construct($type) {
		if(file_exists($_SERVER['DOCUMENT_ROOT'] . '/lang/' . LANG . '/' . strtolower($type) . '.php')){
			include($_SERVER['DOCUMENT_ROOT'] . '/lang/' . LANG . '/' . strtolower($type) . '.php');
			$this->lang = $LANG;
		}
		$this->content = $_SERVER['DOCUMENT_ROOT'] . '/templates/' . strtolower($type) . '.html';
	}

	public function generate($data)
	{
		if ((is_array($data) || is_object($data)) && file_exists($this->content)) {
			include ($this->content);
		}
	}


} 