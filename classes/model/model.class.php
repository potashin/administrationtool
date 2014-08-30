<?php


namespace Classes\Model;

class Model
{
	protected $connection;

 	public function __construct(){
	    $this->connection = new \Classes\Core\Database();
	    /*$query = 'DELETE FROM
	              	RUNNING_INSTANCES
	              WHERE
	              	DATEDIFF(SECOND, LAST_HEARTBEAT, CURRENT_TIMESTAMP )>15';
	    $this->connection->query($query)->execute();*/
    }
}