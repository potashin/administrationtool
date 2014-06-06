<?php

namespace Classes\View;

class View
{
	private $template = './templates/frame.html';

	private $content;

	public function __construct($type) {
		$this->content = './templates/' . $type . '.html';
	}

	public function generate($data)
	{
		$counter = 0;
		if (is_array($data) || is_object($data)) {
			include ($this->template);
		}
	}


} 