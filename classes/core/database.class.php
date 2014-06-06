<?php

namespace Classes\Core;

use PDO;

class Database
{

    private $handler ;

    private $session ;

    private $db_type = 'firebird' ;
    
    private $db_host = '127.0.0.1' ;

    private $db_path = '';
    
    private $db_user = 'SYSDBA' ;
    
    private $db_password = '' ;

    public function __construct(){
        try {
            $this->handler = new PDO("{$this->db_type}:dbname={$this->db_host}:{$this->db_path}",
                                     $this->db_user,
                                     $this->db_password);
            $this->handler->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	        $this->handler->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_EMPTY_STRING);
        } catch (PDOException $error) {
            throw new \Exception($error->getMessage());
        }
    }

    public function __destruct(){
        $this->handler = null;
	    $this->session = null;
    }

    public function query($query) {
        $this->session = $this->handler->prepare($query);
        $this->session->setFetchMode(PDO::FETCH_ASSOC);
        return $this;
    }

    public function execute($placeholder = null) {
        try {
            $this->session->execute($placeholder);
	        return $this->session;
        } catch (PDOException $error) {
            throw new \Exception($error->getMessage());
        }
    }
}
