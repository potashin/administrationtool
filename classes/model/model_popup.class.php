<?php

	namespace Classes\Model;

	class Model_Popup extends Model
	{
		public function __construct()
		{
			parent::__construct();
		}

		public function show($type, $parameter = array ())
		{
			$dataObject = new \Classes\Core\Data();
			switch ($type['TYPE'])
			{
				case 'CS' :
					$query = "SELECT APP_NAME
									, DESCRIPTION
									, ENABLED
									, PATH
									, SCHEDULE
									, CONFIGURATION
			                  FROM GET_APPLICATION_SETTINGS
			                  WHERE 1 <> 1";

					$dataObject->action['UPDATE'] = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->table = false;
					$dataObject->hidden = array (
						'APP_NAME' => 'INSTANCEID'
					);
					$dataObject->options = array ('SCHEDULE');
					break;
				case 'AS' :
					$query = "SELECT *
			                  FROM GET_APPLICATION_SETTINGS
			                  WHERE APP_NAME = :APP_NAME";

					$dataObject->ignore = array (
						'HOSTS'      => true,
						'EVENTS'     => true,
						'INSTANCES'  => true,
					);
					$dataObject->action['INSERT'] = false;
					$dataObject->table = false;
					$dataObject->hidden = array (
						'APP_NAME' => 'INSTANCEID'
					);
					$dataObject->options = array ('SCHEDULE');
					break;
				case 'IS' :
					$query = "SELECT *
				                  FROM GET_INSTANCE_SETTINGS
				                  WHERE APP_NAME = :APP_NAME
				                    AND INSTANCEID = :INSTANCEID";

					$dataObject->ignore = array (
						'APP_DESCRIPTION'    => false,
						'INHERITED_SCHEDULE' => false,
						'HOSTS'      => true,
						'EVENTS'     => true,
					);
					$dataObject->action['INSERT'] = false;
					$dataObject->table = false;
					$dataObject->options = array ('SCHEDULE');
					break;
				case 'AH' :
					$query = "SELECT *
							  FROM GET_APPLICATIONS_HOSTS
							  WHERE APP_NAME = :APP_NAME";

					$dataObject->ignore = array (
						'APP_NAME'   => false,
						'IS_ENABLED' => false,
						'HOSTID'     => false,
						'DESCRIPTION' => true,
					    'ATTACHED' =>false
					);
					$dataObject->hidden = array (
						'DESCRIPTION' => 'HOSTID'
					);
					$dataObject->headers = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->action['INSERT'] = false;
					//$dataObject->action['UPDATE'] = false;
					break;
				case 'AE' :
					$query = "SELECT EVENTNAME
								   , COMMAND
								   , PARAMETERS
							  FROM GET_APPLICATION_EVENTS
							  WHERE APP_NAME = :APP_NAME";

					$dataObject->options = array ('EVENTNAME');
					$dataObject->action['DELETE'] = false;
					$dataObject->action['INSERT'] = false;
					break;
				case 'AI' :
					$query = "SELECT ID AS INSTANCEID
								   , DESCRIPTION
								   , IIF(CONFIG IS NULL, '', 'Yes') AS CONFIGURED
								   , IS_ENABLED
							  FROM INSTANCES
							  WHERE APP_NAME = :APP_NAME";
					$dataObject->ignore = array ('CONFIGURED' => true);
					break;

				case 'IH' :
					$query = "SELECT *
							  FROM GET_INSTANCES_HOSTS
							  WHERE APP_NAME = :APP_NAME
							    AND ID = :INSTANCEID";

					$dataObject->ignore = array (
						'APP_NAME'   => false,
						'ID'         => false,
						'IS_ENABLED' => false,
						'HOSTID'     => false,
						'DESCRIPTION' => true,
					);
					$dataObject->hidden = array (
						'DESCRIPTION' => 'HOSTID'
					);
					$dataObject->headers = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->action['INSERT'] = false;
					$dataObject->action['UPDATE'] = false;
					break;
				case 'IE' :
					$query = "SELECT EVENTNAME
								   , COMMAND
								   , PARAMETERS
							  FROM GET_INSTANCE_EVENTS
							  WHERE APP_NAME = :APP_NAME
							    AND INSTANCEID = :INSTANCEID";

					$dataObject->action['DELETE'] = false;
					$dataObject->action['INSERT'] = false;
					$dataObject->options = array ('EVENTNAME');
					break;
				case 'SC' :
					$query = "SELECT *
							  FROM SCHEDULES
						      WHERE ID = :SCHEDULE";

					$dataObject->action['INSERT'] = false;
					break;
				case 'SA' :
					$query = "SELECT *
							  FROM SCHEDULES
							  WHERE 1 <> 1";

					$dataObject->action['UPDATE'] = false;
					$dataObject->action['DELETE'] = false;
					break;
				/*case 'SH' :
					$query = "SELECT *
							  FROM SCHEDULES";
					$dataObject->options = array ('SCHEDULE');
					break;*/
				case 'LE' :
					if(empty($parameter)){
						$query = "SELECT *
							      FROM SCHEDULES";
						$dataObject->options = array ('SCHEDULE');
					}
					else
					{
						$query = "SELECT EVENTTIME
								   , EVENTNAME
								   , WORKDAY
								   , ACTUAL
							  FROM GET_EVENTS
							  WHERE SCHEDULEID = :SCHEDULE
							  ORDER BY EVENTTIME";
						$dataObject->ignore = array ('ACTUAL' => false);
						$dataObject->options = array ('EVENTNAME', 'WORKDAY');
					}
					break;
				case 'EC' :
					$query = "SELECT  *
								FROM CALENDAR";
					break;
				case 'LH' :
					$query = "SELECT  *
								  FROM HOSTS";
					break;
				case 'LW' :
					$query = "SELECT  *
								  FROM WEEKDAYS";
					$dataObject->action['INSERT'] = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->action['UPDATE'] = false;
					break;
				case 'ES' :
					$query = "SELECT  *
								  FROM EVENTTYPES";
					$dataObject->action['INSERT'] = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->action['UPDATE'] = false;
					break;
				default :
					return 'Undefined show request';
			}
			//var_dump($dataObject->getDataObject($query, $parameter));

			return $dataObject->getDataObject($query, $parameter);
		}

		public function perform($type, $parameter)
		{
			switch ($type["TYPE"])
			{
				case 'AH' :
				case 'IH' :
					$procedure = "ATTACH_HOST";
					break;
				case 'AE' :
				case 'IE' :
					$procedure = "ATTACH_EVENT";
					break;
				case 'AA' :
				case 'AI' :
					$end = array_splice($parameter, -1, 1);
					$parameter = array_merge(
						$parameter,
						array (
							'SCHEDULEID' => null,
							'CONFIG'     => null,
							'PATH'       => null,
						),
						$end
					);

				case 'CS' :
				case 'AS' :
				case 'IS' :
					$procedure = "ATTACH_APP_OR_INS";
					break;

				case 'LE' :
					$procedure = "SCHEDULE_EVENTS";
					break;
				case 'EC' :
					$procedure = "CALENDAR_EVENTS";
					break;
				case 'LH' :
					$procedure = "MAP_HOST";
					break;
				case 'SA' :
				case 'SC' :
					$procedure = "ATTACH_SCHEDULE";
					break;
				default :
					throw new \Exception('Undefined perform request');
			}

			$query = 'EXECUTE PROCEDURE'
			         . ' ' . $procedure
			         . ' ( :' . implode(', :', array_keys($parameter)) . ' )';

			$this->connection->query($query)->execute($parameter);
		}

	}