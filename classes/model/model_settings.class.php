<?php

namespace Classes\Model;

class Model_Settings extends Model
{
	public function __construct() {
		 parent::__construct();
	}

	public function edit($parameter){
		end($parameter);
		$query_type = key($parameter);
		$queries = \Classes\Core\Query_Builder::settings($query_type);
		foreach($queries as $outer=>$query){
			$temporary = $this->connection
							  ->query($query)
							  ->execute($parameter)
							  ->fetchAll();
			$temporary = count($temporary) > 1 ? $temporary : array_pop($temporary);
			$final[$outer] = $temporary;
		}
		$this->trimRecursive($final);
		$final['type'] = 'Update';
		return $final;
	}

	public function create(){
		$query = 'SELECT ID AS SCHEDULE,\'N\' as ENABLED FROM SCHEDULES';
		$final['SCHEDULES'] = $this->connection->query($query)->execute()->fetchAll();
		$final['type'] = 'Insert';
		return $final;
	}


} 