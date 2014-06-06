<?php


namespace Classes\Model;

class Model
{
	protected $connection;



 	public function __construct(){
	    $this->connection = new \Classes\Core\Database();
	    $query = 'DELETE FROM
	              	RUNNING_INSTANCES
	              WHERE
	              	DATEDIFF(SECOND, LAST_HEARTBEAT, CURRENT_TIMESTAMP )>15';
	    $this->connection->query($query)->execute();
    }

	public function trimRecursive(&$array){
		foreach ($array as &$value){
			if(is_array($value)){
				$this->trimRecursive($value);
			} else {
				$value = trim($value);
			}
		}
	}

	public function tableMeta($table) {
		$query = \Classes\Core\Query_Builder::system('meta');
		$resource = $this->connection->query($query)->execute($table);
		while ($row = $resource->fetch()) {
			foreach ($row as $value) {
				$fields[] = trim($value);
			}
		}
		if(!isset($fields)){
			throw new \Exception('Error occured while accessing metadata');
		}
		return $fields;
	}

	public function tableKeys($table){
		$query = \Classes\Core\Query_Builder::system('keys');
		$resource = $this->connection->query($query)->execute($table);
		return $resource;
	}
}