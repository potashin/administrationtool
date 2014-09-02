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
			      AND giae.EVENTNAME = :COMMAND
			      AND giae.COMMAND IS NOT NULL
			      AND giae.PATH IS NOT NULL";

		$row = $this->connection
					->query($query)
					->execute($data)
					->fetch();
		if(empty($row)){
			throw new \Exception('<p>This action is forbidden. Possible reasons: </p><ul><li>Parameters are set inaccurate</li> <li>The action is not allowed in the application or instance settings</li><li>Action is not actual anymore</li></ul>');
		}else{
			$ssh = new \Classes\Core\SSH($row['FQDN']) ;
			$input = "cd {$row['PATH']} && {$row['COMMAND']} {$row['PARAMETERS']} {$row['INSTANCEID']}";
			return $ssh->exec($input);
		}
	}
} 