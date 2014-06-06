<?php

namespace Classes\Model;

class Model_Main extends Model
{
	public function __construct() {
		parent::__construct();
	}

	public function get(){
		$query = 'SELECT APP_NAME
                       , TOTAL
				       , RUNNING
				  	   , (TOTAL - RUNNING) AS PENDING
				  	   , (CASE WHEN TOTAL - RUNNING = 0 THEN \'CORRECT\' ELSE \'INCORRECT\' END) AS STATE
				  FROM
				  (
					SELECT APP_NAME
					     , COUNT(*) AS TOTAL
					     , COUNT(CASE WHEN (EVENTTYPEID IN (\'T\',\'U\')  AND IS_RUNNING = \'N\') OR (EVENTTYPEID IN (\'S\',\'R\')  AND IS_RUNNING = \'Y\')  THEN EVENTTYPEID  END) AS RUNNING
					FROM GET_INSTANCE_ACTUAL_EVENTS
					GROUP BY APP_NAME
				  )';


		$result = $this->connection->query($query)->execute();
		while ($value = $result->fetch()) {
			$query = 'SELECT '
				   .    'INSTANCEID, '
				   .    'APP_NAME, '
				   .    'DESCRIPTION, '
				   .    'EVENTTYPEID, '
				   .    'EVENTNAME, '
				   .    'EVENTTIME, '
				   .    'RUNNING_HOST AS HOST, '
				   .    'HOSTS, '
				   .    'LAST_HEARTBEAT, '
				   .    'IS_RUNNING '
				   . 'FROM '
				   .    'GET_INSTANCE_ACTUAL_EVENTS '
			       . 'WHERE '
			       .    'APP_NAME = :APP_NAME';
			$res = $this->connection->query($query)->execute((array)$value['APP_NAME']);
			$i = 0;
			$final[trim($value['APP_NAME'])]['PENDING'] = $value['PENDING'];
			$final[trim($value['APP_NAME'])]['RUNNING'] = $value['RUNNING'];
			$final[trim($value['APP_NAME'])]['TOTAL'] = $value['TOTAL'];
			while ($val = $res->fetch()) {
				foreach($val as $key=>$field){
					if ($key === 'HOSTS') {
						$final[trim($value['APP_NAME'])]['DATA'][$i][trim($key)] = array_map('trim', explode(',', $field));
					} else {
						$final[trim($value['APP_NAME'])]['DATA'][$i][trim($key)] = trim($field);
					}
				}
				$i++;
			}
		}
		return isset($final) ? $final : array();
	}
}