<?php

namespace Classes\Model;

class Model_Popup extends Model
{
	public function __construct() {
		parent::__construct();
	}

	public function get($table){
		$final['field'] = $this->tableMeta($table);
		$query = "SELECT *
			      FROM
			      {$table["TARGET"]}"  ;
		$resource = $this->connection->query($query)->execute();
		$i = 0;
		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				$final[$key][] = trim($row[$key]);
			}
			$i++;
		}
		$final['rows'] = $i;
		$final['columns'] = $resource->columnCount();

		if ($table['TARGET'] === 'GET_TODAY_EVENTS' or $table['TARGET'] === 'EVENTS') {
			$query = 'SELECT '
				.    'SCHEDULEID, '
				.    'EVENTTIME '
				. 'FROM '
				.    'GET_TODAY_ACTUAL_EVENTS';
			$actual = $this->connection->query($query)->execute();
			while($row = $actual->fetch()){
				for ( $i = 0; $i < $final['rows']; $i++) {
					if(trim($row["SCHEDULEID"]) === $final["SCHEDULEID"][$i] and
						trim($row["EVENTTIME"]) === $final["EVENTTIME"][$i]
					){
						$final['actual'][] = $i;
					}
				}
			}
		}
		switch ($table['TARGET']) {
			case 'WEEKDAYS':
			case 'GET_TODAY_EVENTS':
				$final['actions'] = false;
				break;
			default:
				$final['actions'] = true;
				$resource = $this->tableKeys($table);
				while ($row = $resource->fetch()) {
					$this->trimRecursive($row);
					$query = 'SELECT DISTINCT '
						.    $row['PK'] . ' AS ' .  $row['FK'] .
						' FROM '
						.     $row['TBL'];
					$foreign = $this->connection->query($query)->execute();
					$final['options']['key'][] = $row['FK'];
					while ($options = $foreign->fetch()) {
						$final['options'][$row['FK']][] = trim($options[$row['FK']]);
					}
				}
		}
		$final['options']['flag'] = isset($final['options']) ? true : false ;
		return json_encode($final, JSON_FORCE_OBJECT);
	}

	public function applicationHosts($parameter){
		$query = "SELECT h.ID
                        , h.DESCRIPTION
                        , COALESCE(a.IS_ENABLED,'N') AS ATTACHED
                        , h.IS_ENABLED AS ENABLED
				   FROM APPLICATION_HOSTS a RIGHT JOIN HOSTS h ON h.ID = a.HOSTID AND a.APP_NAME = :APPLICATION";
		$resource = $this->connection
						 ->query($query)
						 ->execute($parameter);
		$i = 0;
		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				$final[$key][] = trim($row[$key]);
				if($i == 0){
					$final['field'][] = $key;
				}
			}
			$i++;
		}

		$final['rows'] = $i;
		$final['columns'] = $resource->columnCount();

		$final['options']['flag'] = isset($final['options']) ? true : false ;

		return json_encode($final, JSON_FORCE_OBJECT);
	}

	public function applicationInstances($parameter){
		$query = "SELECT h.ID
                       , h.DESCRIPTION
                       , CASE WHEN h.CONFIG IS NOT NULL THEN 'Y' ELSE 'N' END AS \"INDIVIDUAL SETTINGS\"
                       , h.IS_ENABLED
				  FROM INSTANCES h
				  WHERE h.APP_NAME = :APPLICATION";
		$resource = $this->connection
						 ->query($query)
						 ->execute($parameter);
		$i = 0;
		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				$final[$key][] = trim($row[$key]);
				if($i == 0){
					$final['field'][] = trim($key);
				}

			}
			$i++;
		}

		$final['rows'] = $i;
		$final['columns'] = $resource->columnCount();
		$final['actions'] = true;
		$final['options']['flag'] = isset($final['options']) ? true : false ;
		return json_encode($final, JSON_FORCE_OBJECT);
	}

	public function applicationEvents($parameter){
		$query = "SELECT
					E.EVENTNAME,
					A.COMMAND,
					A.PARAMETERS
				  FROM
					(
						SELECT
							COMMAND,
							PARAMETERS,
							EVENTTYPEID
						FROM
							APPLICATION_EVENTS
						WHERE
							APP_NAME = :APPLICATION
					) A RIGHT JOIN EVENTTYPES E ON A.EVENTTYPEID = E.ID";
		$resource = $this->connection
			->query($query)
			->execute($parameter);
		$i = 0;
		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				$final[$key][] = trim($row[$key]);
				if($i == 0){
					$final['field'][] = trim($key);
				}

			}
			$i++;
		}

		$final['rows'] = $i;
		$final['columns'] = $resource->columnCount();
		$final['actions'] = true;
		$final['options']['flag'] = isset($final['options']) ? true : false ;
		return json_encode($final, JSON_FORCE_OBJECT);
	}


	public function show($parameter){
		end($parameter);
		$query_type = key($parameter);
		$query = \Classes\Core\Query_Builder::$query_type();
		$resource = $this->connection
						  ->query($query)
						  ->execute($parameter);
		$i = 0;
		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				if($key == 'ACTUAL'){
					$final['actual']['state'][] = (bool)$value;
				} else {
					$final[$key][] = trim($row[$key]);
					if($i == 0){
						$final['field'][] = trim($key);
					}
				}
			}
			$i++;
		}

		$final['rows'] = $i;
		$final['columns'] = $resource->columnCount();
		$final['actions'] = true;
		foreach($this->get_option_list($query_type) as $value){
			$final['options']['key'][] = $value;
			$query = \Classes\Core\Query_Builder::options($value);
			$resource = $this->connection
							 ->query($query)
							 ->execute();
			while ($row = $resource->fetch()) {
				$final['options'][$value][] = trim($row[$value]);
			}
		}
		$final['options']['flag'] = isset($final['options']) ? true : false ;
		$final['actual']['flag'] = isset($final['actual']) ? true : false ;
		$final['actual']['flag'] ? $final['columns']-- : $final['columns'];
		return json_encode($final, JSON_FORCE_OBJECT);
	}

	public function get_option_list($type){
		switch($type){
			case 'EVENTS':
				$list = array('EVENTNAME', 'DESCRIPTION');
				break;
			default:
				return false;
		}
		return $list;
	}

	public function delete($table, $data){
		$result = $this->tableMeta($table);
		$query = \Classes\Core\Query_Builder::template('delete', $table['TARGET'], $result, $data);
		$this->connection->query($query)->execute($data);
	}

	public function update($table, $data){
		$result = $this->tableMeta($table);
		$query = \Classes\Core\Query_Builder::template('update', $table['TARGET'], $result, $data);
		$output = $this->connection->query($query)->execute($data);
		while($row = $output->fetch()){
			foreach ($row as $key => $value) {
				$edited['field'][] = $key;
				$edited[$key][] = trim($row[$key]);
			}
		}
		$edited['columns'] = $output->columnCount();
		$edited['rows'] = 1;
		return json_encode($edited, JSON_FORCE_OBJECT);
	}

	public function insert($table, $data){
		$result = $this->tableMeta($table);
		$query = \Classes\Core\Query_Builder::template('insert', $table['TARGET'], $result, $data);
		$this->connection->query($query)->execute($data);
	}
} 