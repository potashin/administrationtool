<?php

namespace Classes\Model;

class Model_Remote extends Model
{
	public function __construct() {
		parent::__construct();
	}

	public function execute($data){
		$query = "SELECT giae.APP_NAME
				      , giae.INSTANCEID
				      , giae.PARAMETERS
				      , giae.PATH
				      , giae.COMMAND
				      , h.FQDN
			    FROM GET_INSTANCE_ACTUAL_EVENTS giae JOIN HOSTS h ON h.ID = :HOST AND giae.HOSTS LIKE '%'||h.id||'%'
			    WHERE giae.APP_NAME = :APP_NAME
			      AND giae.INSTANCEID = :INSTANCE
			      AND giae.EVENTNAME = :COMMAND";

		$row = $this->connection
					->query($query)
					->execute($data)
					->fetch();

		$ssh = new \Classes\Core\SSH($row['FQDN']) ;
		$input = "cd {$row['PATH']} && {$row['COMMAND']} {$row['PARAMETERS']} {$row['INSTANCEID']}";

		return $ssh->exec($input);
	}
} 