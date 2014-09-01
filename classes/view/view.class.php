<?php

namespace Classes\View;

class View
{

	private $content;

	public function __construct($type) {
		$this->lang = $_SERVER['DOCUMENT_ROOT'] . '/lang/' . LANG . '/' . strtolower($type) . '.php';
		$this->content = $_SERVER['DOCUMENT_ROOT'] . '/templates/' . strtolower($type) . '.html';
	}

	public function generate($data)
	{
		$counter = 0;
		if ((is_array($data) || is_object($data)) && file_exists($this->lang) && file_exists($this->content)) {
			include ($this->lang);
			include ($this->content);
		}
	}


} 