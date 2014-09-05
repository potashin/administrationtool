<?php

namespace Classes\Model;

class Model_Monitor extends Model
{
	public function __construct() {
		parent::__construct();
	}

	public function execute(){
		$this->checkChanges();
		return $this->getHeartbeat();
	}

	private function getHeartbeat(){
		$query = "SELECT APP_NAME || '_' || INSTANCEID AS ID, LAST_HEARTBEAT
				FROM GET_INSTANCE_ACTUAL_EVENTS
				WHERE LAST_HEARTBEAT IS NOT NULL
				  AND 15 > datediff(second,LAST_HEARTBEAT,current_timestamp)";
		$resource = $this->connection
						 ->query($query)
						 ->execute();
		$final = array();
		while($row = $resource->fetch()){
			$final[$row['ID']] = $row['LAST_HEARTBEAT'];
		}
		return json_encode($final,JSON_FORCE_OBJECT);
	}

	private function checkChanges(){

	}
}