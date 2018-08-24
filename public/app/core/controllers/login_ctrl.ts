import _ from 'lodash';
import coreModule from '../core_module';
import config from 'app/core/config';

export class LoginCtrl {
  /** @ngInject */
  constructor($scope, backendSrv, contextSrv, $location, $http, $sce) {
    $scope.formModel = {
      user: '',
      email: '',
      password: '',
    };

    $scope.command = {};
    $scope.result = '';

    contextSrv.sidemenu = false;

    $scope.oauth = config.oauth;
    $scope.oauthEnabled = _.keys(config.oauth).length > 0;
    $scope.ldapEnabled = config.ldapEnabled;
    $scope.authProxyEnabled = config.authProxyEnabled;

    $scope.disableLoginForm = config.disableLoginForm;
    $scope.disableUserSignUp = config.disableUserSignUp;
    $scope.loginHint = config.loginHint;

    $scope.loginMode = true;
    $scope.submitBtnText = 'Log in';

    $scope.ssologin = function(trustedUrl) {
      $http.jsonp(trustedUrl, { jsonpCallbackParam: 'jsonpCallback' }).then(function(data) {
        var token = data.data.token;

        if (null !== token && undefined !== token && token !== '') {
          $scope.formModel = {
            user: token,
            email: '',
            password: token,
          };
          backendSrv.post('/login', $scope.formModel).then(function(result) {
            $scope.result = result;
            $scope.toGrafana();
          });
        }
      });
    };

    $scope.init = function() {
      $scope.$watch('loginMode', $scope.loginModeChanged);
      var url = 'http://10.1.236.114:18080/occiMain/api/v1/sso/login';
      var trustedUrl = $sce.trustAsResourceUrl(url);
      $scope.ssologin(trustedUrl);

      if (config.loginError) {
        $scope.appEvent('alert-warning', ['Login Failed', config.loginError]);
      }
    };

    $scope.submit = function() {
      if ($scope.loginMode) {
        $scope.login();
      } else {
        $scope.signUp();
      }
    };

    $scope.changeView = function() {
      let loginView = document.querySelector('#login-view');
      let changePasswordView = document.querySelector('#change-password-view');

      loginView.className += ' add';
      setTimeout(() => {
        loginView.className += ' hidden';
      }, 250);
      setTimeout(() => {
        changePasswordView.classList.remove('hidden');
      }, 251);
      setTimeout(() => {
        changePasswordView.classList.remove('remove');
      }, 301);

      setTimeout(() => {
        document.getElementById('newPassword').focus();
      }, 400);
    };

    $scope.changePassword = function() {
      $scope.command.oldPassword = 'admin';

      if ($scope.command.newPassword !== $scope.command.confirmNew) {
        $scope.appEvent('alert-warning', ['New passwords do not match', '']);
        return;
      }

      backendSrv.put('/api/user/password', $scope.command).then(function() {
        $scope.toGrafana();
      });
    };

    $scope.skip = function() {
      $scope.toGrafana();
    };

    $scope.loginModeChanged = function(newValue) {
      $scope.submitBtnText = newValue ? 'Log in' : 'Sign up';
    };

    $scope.signUp = function() {
      if (!$scope.loginForm.$valid) {
        return;
      }

      backendSrv.post('/api/user/signup', $scope.formModel).then(function(result) {
        if (result.status === 'SignUpCreated') {
          $location.path('/signup').search({ email: $scope.formModel.email });
        } else {
          window.location.href = config.appSubUrl + '/';
        }
      });
    };

    $scope.login = function() {
      delete $scope.loginError;

      if (!$scope.loginForm.$valid) {
        return;
      }

      backendSrv.post('/login', $scope.formModel).then(function(result) {
        $scope.result = result;

        if ($scope.formModel.password !== 'admin' || $scope.ldapEnabled || $scope.authProxyEnabled) {
          $scope.toGrafana();
          return;
        }
        $scope.changeView();
      });
    };

    $scope.toGrafana = function() {
      var params = $location.search();

      if (params.redirect && params.redirect[0] === '/') {
        window.location.href = config.appSubUrl + params.redirect;
      } else if ($scope.result.redirectUrl) {
        window.location.href = $scope.result.redirectUrl;
      } else {
        window.location.href = config.appSubUrl + '/';
      }
    };

    $scope.init();
  }
}

coreModule.controller('LoginCtrl', LoginCtrl);
