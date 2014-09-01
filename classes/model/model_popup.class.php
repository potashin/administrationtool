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
									, IS_ENABLED
									, PATH
									, SCHEDULE
									, CONFIG
			                  FROM GET_APPLICATION_SETTINGS
			                  WHERE 1 <> 1";

					$dataObject->action['UPDATE'] = false;
					$dataObject->action['DELETE'] = false;
					$dataObject->options = array ('SCHEDULE' => array ());
					break;
				case 'AS' :
					$query = "SELECT *
			                  FROM GET_APPLICATION_SETTINGS
			                  WHERE APP_NAME = :APP_NAME";

					$dataObject->ignore = array (
						'ENABLED_HOSTS',
						'DISABLED_HOSTS',
						'ENABLED_EVENTS',
						'DISABLED_EVENTS',
						'ENABLED_INSTANCES',
						'DISABLED_INSTANCES'
					);
					$dataObject->action['INSERT'] = false;
					$dataObject->options = array ('SCHEDULE' => array ());
					break;
				case 'IS' :
					$query = "SELECT *
				                  FROM GET_INSTANCE_SETTINGS
				                  WHERE APP_NAME = :APP_NAME
				                    AND INSTANCEID = :INSTANCEID";

					$dataObject->ignore = array (
						'APP_DESCRIPTION',
						'INHERITED_SCHEDULE',
						'ENABLED_HOSTS',
						'DISABLED_HOSTS',
						'ENABLED_EVENTS',
						'DISABLED_EVENTS'
					);
					$dataObject->action['INSERT'] = false;
					$dataObject->options = array ('SCHEDULE' => array ());
					break;
				case 'AH' :
					$query = "SELECT *
								  FROM GET_APPLICATIONS_HOSTS
								  WHERE APP_NAME = :APP_NAME";
					$dataObject->ignore = array (
						'APP_NAME',
						'IS_ENABLED',
						'DESCRIPTION',
					);
					break;
				case 'AE' :
					$query = "SELECT EVENTNAME
								   , COMMAND
								   , PARAMETERS
							  FROM GET_APPLICATION_EVENTS
							  WHERE APP_NAME = :APP_NAME";

					$dataObject->options = array ('EVENTNAME' => array ());
					$dataObject->action['DELETE'] = false;
					$dataObject->action['INSERT'] = false;
					break;
				case 'AI' :
					$query = "SELECT ID AS INSTANCEID
								   , DESCRIPTION
								   , (CASE WHEN CONFIG IS NULL THEN 'N' ELSE 'Y' END) AS INDIVIDUAL_SETTINGS
								   , IS_ENABLED
							  FROM INSTANCES
							  WHERE APP_NAME = :APP_NAME";

					$dataObject->ignore[] = 'INDIVIDUAL_SETTINGS';
					break;

				case 'IH' :
					$query = "SELECT *
							  FROM GET_INSTANCES_HOSTS
							  WHERE APP_NAME = :APP_NAME
							    AND ID = :INSTANCEID";

					$dataObject->ignore = array (
						'APP_NAME',
						'ID',
						'IS_ENABLED',
						'DESCRIPTION',
					);
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
					$dataObject->options = array ('EVENTNAME' => array ());
					break;
				case 'SH' :
					$query = "SELECT ID
									   , IS_ENABLED
									   , DESCRIPTION
								  FROM SCHEDULES";

					$dataObject->options = array ('SCHEDULE' => array ());
					break;
				case 'LE' :
					$query = "SELECT EVENTTIME
								   , EVENTNAME
								   , WORKDAY
								   , ACTUAL
							  FROM GET_EVENTS
							  WHERE SCHEDULEID = :SCHEDULE
							  ORDER BY EVENTTIME";

					$dataObject->ignore[] = 'ACTUAL';
					$dataObject->options = array ('EVENTNAME' => array (), 'WORKDAY' => array ());
					break;
				case 'EC' :
					$query = "SELECT  *
								FROM CALENDAR";
					break;
				case 'LH' :
					$query = "SELECT  *
								  FROM HOSTS";
					break;
				case 'SC' :
					$query = "SELECT ID AS SCHEDULE
								   , DESCRIPTION
								   , IS_ENABLED
								  FROM SCHEDULES
						      WHERE ID = :SCHEDULE";

					$dataObject->action['INSERT'] = false;
					break;
				case 'SA' :
					$query = "SELECT ID AS SCHEDULE
								   , DESCRIPTION
								   , IS_ENABLED
								  FROM SCHEDULES
							  WHERE 1 <> 1";

					$dataObject->action['UPDATE'] = false;
					$dataObject->action['DELETE'] = false;
					break;
				default :
					return 'Undefined show request';
			}
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
					$end = array_splice($parameter, -1,1);
					$parameter = array_merge(
						$parameter,
						array(
							'SCHEDULEID' => null,
							'CONFIG' => null,
							'PATH' => null,
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
			array_walk(
				$parameter, function (&$item)
				{
					$item = empty($item) ? null : $item;
				}
			);

			$query = 'EXECUTE PROCEDURE'
			         . ' ' . $procedure
			         . ' ( :' . implode(', :', array_keys($parameter)) . ' )';

			$this->connection->query($query)->execute($parameter);
		}

	}