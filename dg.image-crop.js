(function() {
    'use strict';

    angular.module('dg.image-crop', [])
        .directive('dgImageCrop', dgImageCrop);
    
    function dgImageCrop() {
        var vm = {};

        vm.link = link;
        vm.restrict = 'E';
        vm.template = '<div><div></div><div style="display: none;"><canvas id="dgCopyCanvas"></canvas></div></div>';
        vm.replace = true;
        vm.scope = {
            result: '=',
            imgSrc: '@'
        };
        
        return vm;

        function link(scope, element, attr) {
            var img = new Image(),
                context,
                canvas,
                bounds = 10,
                rectangle,
                mouseX,
                mouseY,
                dragged = {
                    topLeft: false,
                    topRight: false,
                    bottomLeft: false,
                    bottomRight: false
                };

            img.onload = function () {
                canvas = document.getElementById('dgCanvas');
                var $canvas = angular.element(document.getElementById('dgCanvas'));

                $canvas.attr('width', (img.width + 10 * 2) + 'px');
                $canvas.attr('height', (img.height + 10 * 2) + 'px');

                rectangle = {
                    startX: bounds,
                    startY: bounds,
                    width: img.width,
                    height: img.height
                };

                context = canvas.getContext('2d');

                canvas.addEventListener('mousedown', mousedown, false);
                canvas.addEventListener('mouseup', mouseup, false);
                canvas.addEventListener('mousemove', mousemove, false);

                draw();

                scope.$apply(function() {
                    scope.loaded = true;
                });
            };

            img.src = scope.imgSrc || '';

            function drawCircle(x, y, radius) {
                context.fillStyle = "#FF0000";
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI);
                context.fill();
            }

            function draw() {
                context.drawImage(img, bounds, bounds);
                context.beginPath();
                context.rect(rectangle.startX, rectangle.startY, rectangle.width, rectangle.height);
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();

                drawCircle(rectangle.startX, rectangle.startY, bounds);
                drawCircle(rectangle.startX + rectangle.width, rectangle.startY, bounds);
                drawCircle(rectangle.startX + rectangle.width, rectangle.startY + rectangle.height, bounds);
                drawCircle(rectangle.startX, rectangle.startY + rectangle.height, bounds);

                copy();
            }
            
            function copy() {
                var copyCanvas = document.getElementById('dgCopyCanvas'),
                    $copyCanvas = angular.element(copyCanvas),
                    copyContext = copyCanvas.getContext('2d');

                $copyCanvas.attr('width', rectangle.width);
                $copyCanvas.attr('height', rectangle.height);

                copyContext.drawImage(img, rectangle.startX - bounds, rectangle.startY - bounds, rectangle.width, rectangle.height, 0, 0, rectangle.width, rectangle.height);

                if (scope.result) {
                    scope.$apply(function() {
                        scope.result.data = copyCanvas.toDataURL();
                    });
                }
            }
            
            function checkBounds(position1, position2) {
                return Math.abs(position1 - position2) < bounds;
            }

            function mousedown(event) {
                mouseX = event.pageX - this.offsetLeft;
                mouseY = event.pageY - this.offsetTop;

                // Top left 
                if (checkBounds(mouseX, rectangle.startX) && checkBounds(mouseY, rectangle.startY)) {
                    dragged.topLeft = true;
                }
                // Top right
                else if (checkBounds(mouseX, rectangle.startX + rectangle.width) && checkBounds(mouseY, rectangle.startY)) {
                    dragged.topRight = true;
                }
                // Bottom left
                else if (checkBounds(mouseX, rectangle.startX) && checkBounds(mouseY, rectangle.startY + rectangle.height)) {
                    dragged.bottomLeft = true;
                }
                // Bottom right
                else if (checkBounds(mouseX, rectangle.startX + rectangle.width) && checkBounds(mouseY, rectangle.startY + rectangle.height)) {
                    dragged.bottomRight = true;
                }

                // Redraw canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                draw();
            }
            
            function mousemove(event) {
                mouseX = event.pageX - this.offsetLeft;
                mouseY = event.pageY - this.offsetTop;
                
                if (dragged.topLeft) {
                    rectangle.width += rectangle.startX - mouseX;
                    rectangle.height += rectangle.startY - mouseY;
                    rectangle.startX = mouseX;
                    rectangle.startY = mouseY;
                } else if (dragged.topRight) {
                    rectangle.width = Math.abs(rectangle.startX - mouseX);
                    rectangle.height += rectangle.startY - mouseY;
                    rectangle.startY = mouseY;
                } else if (dragged.bottomLeft) {
                    rectangle.width += rectangle.startX - mouseX;
                    rectangle.height = Math.abs(rectangle.startY - mouseY);
                    rectangle.startX = mouseX;
                } else if (dragged.bottomRight) {
                    rectangle.width = Math.abs(rectangle.startX - mouseX);
                    rectangle.height = Math.abs(rectangle.startY - mouseY);
                }

                context.clearRect(0, 0, canvas.width, canvas.height);
                draw();
            }
            
            function mouseup() {
                dragged.topLeft = dragged.topRight = dragged.bottomLeft = dragged.bottomRight = false;
            }
        }
    }
}());