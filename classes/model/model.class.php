<?php


namespace Classes\Model;

class Model
{
	protected $connection;

 	public function __construct(){
	    $this->connection = new \Classes\Core\Database();
    }
}