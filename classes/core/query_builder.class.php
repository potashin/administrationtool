<?php

namespace Classes\Core;


class Query_Builder
{
	static public function template($type, $table, $meta, &$data){
		switch($type){
			case 'update':
				foreach($meta as $value) {
					if(isset($data['BEFORE_' . $value])){
						if (empty($data['BEFORE_' . $value])) {
							$before[] = $value . ' IS NULL ';
							unset($data['BEFORE_' . $value]);
						} else {
							$before[] = $value . ' = :BEFORE_' . $value ;
						}
					}
					if(isset($data['AFTER_' . $value])){
						if (empty($data['AFTER_' . $value])) {
							$after[] = $value . '=null ';
							unset($data['AFTER_' . $value]);
						} else {
							$after[] = $value . ' = :AFTER_' . $value ;
						}
					}
				}
				$query = "UPDATE {$table} SET "
					.       implode(', ', $after) .
					" WHERE "
					.       implode(' and ', $before) .
					" RETURNING "
					.       implode(', ', $meta);
				break;
			case 'insert':
				foreach($meta as $value) {
					if (empty($data[$value])) {
						$values[] = ' NULL';
						unset($data[$value]);
					} else {
						$values[] = ':' . $value ;
					}
				}
				$query = "INSERT INTO
							{$table}
					     (" . implode(', ',$meta) . ")
					     VALUES
					     (" . implode(', ',$values) . ")" ;
				break;
			case 'delete':
				foreach($meta as &$value) {
					if (empty($data[$value])) {
						unset($data[$value]);
						$value .= ' IS NULL' ;
					} else {
						$value .= ' = :' . $value ;
					}
				}
				$query = "DELETE FROM
							{$table}
						  WHERE "
							. implode(' and ', $meta);
				break;
			default:
				throw new \Exception('Undefined table-query type');
		}
		return $query;
	}

	static public function system($type){
		switch($type){
			case 'keys':
				$query = 'SELECT
						   b.RDB$FIELD_NAME AS FK,
						   c.RDB$RELATION_NAME AS TBL,
						   d.RDB$FIELD_NAME AS PK
						  FROM
						   RDB$RELATION_CONSTRAINTS a
						   JOIN RDB$INDEX_SEGMENTS b ON
						       a.RDB$INDEX_NAME = b.RDB$INDEX_NAME
						   JOIN RDB$REF_CONSTRAINTS ON
						       a.RDB$CONSTRAINT_NAME = RDB$REF_CONSTRAINTS.RDB$CONSTRAINT_NAME
						   JOIN RDB$RELATION_CONSTRAINTS c ON
						       RDB$REF_CONSTRAINTS.RDB$CONST_NAME_UQ = c.RDB$CONSTRAINT_NAME
						   JOIN RDB$INDEX_SEGMENTS d ON
						       c.RDB$INDEX_NAME = d.RDB$INDEX_NAME
						  WHERE
						   a.RDB$CONSTRAINT_TYPE = \'FOREIGN KEY\' AND
						   a.RDB$RELATION_NAME = :TARGET';
				break;
			case 'meta':
				$query = 'SELECT
						    RDB$FIELD_NAME
						  FROM
						    RDB$RELATION_FIELDS
						  WHERE
						    RDB$RELATION_NAME = :TARGET
						  ORDER BY
						    RDB$FIELD_POSITION ASC';
				break;
			default:
				throw new \Exception('Undefined meta-query type');
		}
		return $query;
	}

	static public function settings($table){
			switch($table) {
				case 'APPLICATION':
					$select = ' APP_NAME ';
					$where = ' APP_NAME = :APPLICATION ';
					$query = self::applications_and_instances($select, $where , $table);
					$query['INSTANCES'] = 'SELECT ID AS INSTANCE
    							, IS_ENABLED AS IS_ATTACHED
						   FROM INSTANCES WHERE ' . $where;

					break;
				case 'INSTANCE':
					$select .= ' APP_NAME , ID ';
					$where .= ' APP_NAME = :APPLICATION  AND ID = :INSTANCE ';
					$query = self::applications_and_instances($select, $where , $table);
					break;
				default:
					return false;
			}

		return $query;
	}

	static public function schedule(){
		$query = 'SELECT
						IS_ENABLED,
						DESCRIPTION
					FROM
						SCHEDULES
					WHERE
						ID = :SCHEDULE';
		return $query;

	}

	static public function events(){
		$query = 'SELECT
						E.EVENTTIME,
						T.EVENTNAME,
						W.DESCRIPTION,
						CASE WHEN A.EVENTTIME IS NULL THEN NULL ELSE \'true\' END AS ACTUAL
					FROM
						EVENTS E JOIN EVENTTYPES T ON E.EVENTTYPEID = T.ID
								 JOIN WEEKDAYS W ON E.WEEKDAYID = W.ID
								 LEFT JOIN GET_TODAY_ACTUAL_EVENTS A ON A.SCHEDULEID = E.SCHEDULEID
								                                        AND A.EVENTTIME = E.EVENTTIME
								                                        AND A.EVENTTYPEID = E.EVENTTYPEID
					WHERE
						E.SCHEDULEID = :EVENTS';
		return $query;

	}

	static function options($type){
		switch($type){
			case 'DESCRIPTION':
				$query = 'SELECT
								DESCRIPTION
							FROM
								WEEKDAYS
							GROUP BY
								DESCRIPTION';
				break;
			case 'EVENTNAME':
				$query = 'SELECT
								EVENTNAME
							FROM
								EVENTTYPES
							GROUP BY
								EVENTNAME';
				break;
			default: return false;
		}
		return $query;
	}

	static function applications_and_instances($select, $where, $table) {
		$query['COMMON'] = "SELECT
					DESCRIPTION,
					PATH,
					IS_ENABLED,
					{$select}
				  FROM "
			. $table . "S
				  WHERE
					{$where}";
		$query['SCHEDULES'] = "SELECT
					H.ID AS SCHEDULE,
					CASE WHEN A.APP_NAME IS NULL THEN 'N' ELSE 'Y' END AS ENABLED
				  FROM
					SCHEDULES H LEFT JOIN (
						SELECT
							SCHEDULEID,
							{$select}
						FROM "
			. $table . "S
						WHERE
							{$where}
					) A ON A.SCHEDULEID = H.ID";

		$query['HOSTS'] = "SELECT HOSTID
    							, IS_ENABLED AS ENABLED
						   FROM " . $table . "_HOSTS WHERE " . $where;

		$query['EVENTS'] = "SELECT
					E.EVENTNAME,
					(CASE WHEN A.PARAMETERS IS NULL THEN 0 ELSE 1 END) AS MAPPED
				  FROM
					(
						SELECT
							PARAMETERS,
							EVENTTYPEID
						FROM
							" . $table . "_EVENTS
						WHERE
							{$where}
					) A RIGHT JOIN EVENTTYPES E ON A.EVENTTYPEID = E.ID";
		return $query;
	}
} 