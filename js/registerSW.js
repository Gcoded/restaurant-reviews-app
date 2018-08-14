if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    console.log('success');
  }).catch(function(err) {
    console.log('error: '+ err);
  });
}