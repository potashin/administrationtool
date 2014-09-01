<?php

namespace Classes\Core;


class Data {

	public $columns = 0;

	public $rows = 0;

	public $action = array(
						'INSERT' => true ,
						'UPDATE' => true ,
						'DELETE' => true
					);

	public $field = array();

	public $options = array();

	public $content = array();

	public $ignore = array();

	public $include = array();

	public $disabled = array();

	private $connection;

	private $query;

	private $parameter;

	public function __construct(){
		$this->connection = new \Classes\Core\Database();
		return $this;
	}

	public function getDataObject($query, $parameter){
		$this->query = $query;
		$this->parameter = $parameter;
		$this->setContent($query, $parameter);
		$this->setFields();
		$this->include = array_values(array_diff($this->field, $this->ignore));
		$this->setDisabled();
		$this->include = array_flip($this->include);
		$this->ignore = array_flip($this->ignore);


		if($this->options){
			$this->setOptions();
		}

		return json_encode($this, JSON_FORCE_OBJECT);
	}

	private function setContent(){
		$resource = $this->connection
						 ->query($this->query)
						 ->execute($this->parameter);

		$this->columns = $resource->columnCount();

		while ($row = $resource->fetch()) {
			foreach ($row as $key => $value) {
				$this->content[$key][] = trim($value);
			}
			$this->rows++;
		}

		return $this->content;
	}

	private function setOptions(){
		foreach($this->options as $key => &$value){

			$query = "SELECT {$key}_VALUE AS \"VALUE\"
						   , {$key}_LABEL AS \"LABEL\"
					  FROM GET_OPTIONS";

			$value = $this->connection
						 ->query($query)
						 ->execute()
						 ->fetch();
			array_walk($value, function(&$item){ $item = explode(',', $item); });
		}
		return $this->options;
	}

	private function setFields(){
		if(!$this->rows){
			if($length = strpos($this->query,'WHERE')){
				$this->query = substr($this->query,0, $length);
			}
			$query = "SELECT FIRST 1 m.*
					  FROM (SELECT CURRENT_TIMESTAMP AS FIELD
							FROM RDB\$DATABASE) c
					  LEFT JOIN ({$this->query}) m ON 1 = 1";
			$temp = $this->connection->query($query)
									 ->execute()
									 ->fetch();

		} else {
			$temp = $this->content;
		}
		foreach($temp as $key => $value){
			$this->field[] = $key;
		}
	}

	private function setDisabled(){
		$query = "SELECT *
				  FROM GET_PK_KEYS
				  WHERE KEYS IN('" . implode("', '", $this->include) . "')";
		$result = $this->connection->query($query)->execute()->fetchAll();
		if(!empty($result)){
			$this->disabled = array_flip(array_shift($result));
		}
	}

} 