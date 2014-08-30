<?php

namespace Classes\Core;

class SSH
{
	private $ssh_host;

    private $ssh_port = SSH_PORT;

    private $ssh_auth_user = SSH_AUTH_USER;

    private $ssh_auth_pswd = SSH_AUTH_PASSWORD;

    private $connection;

    public function __construct ($host) {
        $this->ssh_host = $host;
        if (!$this->connection = ssh2_connect($this->ssh_host, $this->ssh_port)) {
            throw new \Exception('Error occured while connecting to server via ssh');
        }
        if (!ssh2_auth_password($this->connection, $this->ssh_auth_user, $this->ssh_auth_pswd)) {
            throw new \Exception('Error occured while authenticating via ssh');
        }
    }
    
    public function exec ($cmd) {
        $stream = ssh2_exec($this->connection, $cmd);
        if (!$stream) {
            throw new \Exception('Error occured while executing command via ssh');
        } else {
            stream_set_blocking($stream, true);
            return stream_get_contents($stream);
        }
    }
    
    public function disconnect () {
        try {
            $this->exec('exit');
            $this->connection = null;
        } catch (\Exception $error) {
            throw new \Exception($error->getMessage());
        }

    }
    
    public function __destruct () {
        try {
            $this->disconnect();
        } catch (\Exception $error) {
            throw new \Exception($error->getMessage());
        }
    }
}