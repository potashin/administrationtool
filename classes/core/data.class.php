<?php

	namespace Classes\Core;


	class Data
	{

		public $columns = 0;

		public $rows = 0;

		public $action = array (
			'INSERT' => true,
			'UPDATE' => true,
			'DELETE' => true
		);

		public $field = array ();

		public $options = array ();

		public $content = array ();

		public $ignore = array ();

		public $include = array ();

		public $disabled = array ();

		private $connection;

		private $query;

		public function __construct()
		{
			$this->connection = new \Classes\Core\Database();

			return $this;
		}

		public function getDataObject($query, $parameter)
		{
			$this->query = $query;
			$this->setContent($query, $parameter);
			$this->setFields();
			foreach ($this->ignore as $key => &$value)
			{
				if (!$value)
				{
					$value = $this->content[$key];
					unset($this->field[array_search($key, $this->field)]);
					unset($this->content[$key]);
					$this->columns--;
				}
			}
			$this->include = array_diff_key(array_flip($this->field), $this->ignore);
			$this->setDisabled();

			if ($this->options)
			{
				$this->setOptions();
			}

			return json_encode($this, JSON_FORCE_OBJECT);
		}

		private function setContent($query, $parameter)
		{
			$resource = $this->connection
				->query($query)
				->execute($parameter);

			$this->columns = $resource->columnCount();

			while ($row = $resource->fetch())
			{
				foreach ($row as $key => $value)
				{
					$this->content[$key][] = trim($value);
				}
				$this->rows++;
			}

			return $this->content;
		}

		private function setOptions()
		{
			$query = "SELECT *
						FROM GET_OPTIONS
						WHERE NAME IN ('" . implode("', '", $this->options) . "')";

			$resource = $this->connection
				->query($query)
				->execute();
			while ($row = $resource->fetch())
			{
				$this->options[trim($row['NAME'])] = array (
					'VALUE' => explode(',', $row['VALUE']),
					'LABEL' => explode(',', $row['LABEL'])
				);
			}

			return $this->options;
		}

		private function setFields()
		{
			if (!$this->rows)
			{
				if ($length = strpos($this->query, 'WHERE'))
				{
					$this->query = substr($this->query, 0, $length);
				}
				$query = "SELECT FIRST 1 m.*
					  FROM (SELECT CURRENT_TIMESTAMP AS FIELD
							FROM RDB\$DATABASE) c
					  LEFT JOIN ({$this->query}) m ON 1 = 1";
				$temp = $this->connection->query($query)
					->execute()
					->fetch();

			}
			else
			{
				$temp = $this->content;
			}
			foreach ($temp as $key => $value)
			{
				$this->field[] = $key;
			}
		}

		private function setDisabled()
		{
			$query = "SELECT KEYS
					  FROM GET_PK_KEYS
					  WHERE KEYS IN('" . implode("', '", array_flip($this->include)) . "')";
			$result = $this->connection->query($query)->execute();
			while ($row = $result->fetch())
			{
				$this->disabled[$row['KEYS']] = $row['KEYS'];
			}
		}

	}