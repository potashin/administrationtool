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

		public $headers = true;

		public $options = array ();

		public $content = array ();

		public $ignore = array ();

		public $disabled = array ();

		public $hidden = array ();

		public  $table = true;

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

			$this->setDisabled();
			$this->columns = count($this->field);

			if ($this->options)
			{
				$this->setOptions();
			}

			return $this;
		}

		private function setContent($query, $parameter)
		{
			$resource = $this->connection->query($query)->execute($parameter);

			while ($row = $resource->fetch())
			{
				foreach ($row as $key => $value)
				{
					if (strpos($key, '#') !== false)
					{
						$temp = explode('#', $key);
						$this->content[$temp[1]][$temp[0]][] = $value;

					} else {
						$this->content[$key][] = trim($value);
					}
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
			$this->options = array_flip($this->options);
			$resource = $this->connection->query($query)->execute();
			while ($row = $resource->fetch())
			{
				$this->options[trim($row['NAME'])] = array (
					'VALUE' => explode(',', $row['VALUE']),
					'LABEL' => explode(',', $row['LABEL']),
				    'TITLE' => explode(',', $row['TITLE'])
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
				$temp = $this->connection->query($query)->execute()->fetch();
			}
			else
			{
				$temp = $this->content;
			}
			foreach ($temp as $key => $value)
			{
				if (!array_key_exists($key, $this->ignore) or $this->ignore[$key])
				{
					$this->field[] = $key;
				}
			}
		}

		private function setDisabled()
		{
			$query = "SELECT KEYS
					  FROM GET_PK_KEYS
					  WHERE KEYS IN('" . implode("', '", $this->field) . "')";
			$result = $this->connection->query($query)->execute();
			while ($row = $result->fetch())
			{
				$this->disabled[$row['KEYS']] = $row['KEYS'];
			}
		}

	}