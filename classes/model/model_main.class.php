<?php

	namespace Classes\Model;

	class Model_Main extends Model
	{
		public function __construct()
		{
			parent::__construct();
		}

		public function get()
		{
			$final = array ();

			$query = 'SELECT *
					  FROM GET_APPLICATION_SUMMARY
				      ORDER BY TOTAL DESC';

			$result = $this->connection->query($query)->execute();
			while ($value = $result->fetch())
			{
				$temp = array();
				$temp['SUMMARY'] = $value;

				if (intval($value['TOTAL']) > 0)
				{
					$query = 'SELECT *
						      FROM GET_INSTANCE_ACTUAL_EVENTS
					          WHERE APP_NAME = :APP_NAME
					          ORDER BY INSTANCEID';

					$r = $this->connection->query($query)->execute((array)$value['APP_NAME']);
					while ($v = $r->fetch())
					{
						$v['HOSTS'] = explode(',',$v['HOSTS']);
						$v['HOSTS_DESC'] = explode(',',$v['HOSTS_DESC']);

						$temp['CONTENT'][] = $v;
					}

				}
				$final[] = $temp;
			}

			return $final;
		}
	}