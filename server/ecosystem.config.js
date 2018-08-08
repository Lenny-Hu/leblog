module.exports = {
  apps: [
    {
      name: 'leblog',
      script: './bin/www',
      env: {
        NODE_ENV: "production"
      },
      env_dev: {
        NODE_ENV: "dev"
      },
      env_test: {
        NODE_ENV: "test"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
