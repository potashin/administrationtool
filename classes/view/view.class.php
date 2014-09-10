<?php

namespace Classes\View;

class View
{
	private $content;

	private $lang;

	public function __construct($type) {
		$this->content = $_SERVER['DOCUMENT_ROOT'] . '/templates/' . strtolower($type) . '.html';
		$this->lang = $_SERVER['DOCUMENT_ROOT'] . '/lang/' . LANG . '/' . strtolower($type) . '.php';
	}

	public function generate($data)
	{
		if ((is_array($data) || is_object($data)) && file_exists($this->content)) {
			include ($this->content);
		}
	}


} 