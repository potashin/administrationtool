<?php

namespace Classes\Model;

class Model_Remote extends Model
{
	public function __construct() {
		parent::__construct();
	}

	public function execute($data){

		/*
		$query = 'SELECT '
			   .    'INSTANCEID AS INSTANCE, '
			   .    'PARAMETERS AS ACTION, '
			   .    'PATH AS PATH, '
			   .    'COMMAND AS CMD, '
			   .    '(SELECT FQDN FROM HOSTS WHERE ID = :host) AS HOST '
			   . 'FROM '
			   .    'GET_INSTANCE_ACTUAL_EVENTS '
			   . 'WHERE '
			   .    'INSTANCEID = :id';

		/*$row = $this->connection
					->query($query)
					->execute($data)
					->fetch();
		extract(array_change_key_case($row));
		$ssh = new \Classes\Core\SSH('MacBook-Pro-Nikita.local') ;
		$input = 'cd ' . $path . ' && ' . $cmd . ' ' . $action . ' ' . $instance ;

		return $ssh->exec($input);*/
	}
} 