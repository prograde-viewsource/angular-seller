angular.module('orderCloud')
    .factory('ocProducts', OrderCloudProducts)
;

function OrderCloudProducts($q, $uibModal, ocConfirm, OrderCloud, sdkOrderCloud) {
    var service = {
        Create: _create,
        CreateDefaultPrice: _createDefaultPrice,
        Delete: _delete
    };

    function _create() {
        return $uibModal.open({
            templateUrl: 'productManagement/products/templates/productCreate.modal.html',
            controller: 'ProductCreateModalCtrl',
            controllerAs: 'productCreateModal'
        }).result
    }

    function _createDefaultPrice(product) {
        var df = $q.defer();

        var priceSchedule = {
            name: product.Name + ' Default Price',
            minQuantity: 1,
            priceBreaks: [
                {
                    quantity: 1,
                    price: product.DefaultPrice
                }
            ]
        };
        sdkOrderCloud.PriceSchedules.Create(priceSchedule)
            .then(function(defaultPriceSchedule) {
                setDefaultPriceSchedule(defaultPriceSchedule);
            });

        function setDefaultPriceSchedule(defaultPriceSchedule) {
            product.DefaultPriceScheduleID = defaultPriceSchedule.ID;
            sdkOrderCloud.Products.Patch(product.ID, {defaultPriceScheduleID: defaultPriceSchedule.ID})
                .then(function(product) {
                    df.resolve(product);
                });
        }

        return df.promise;
    }

    function _delete(product) {
        return ocConfirm.Confirm({
                message:'Are you sure you want to delete <br> <b>' + product.Name + '</b>?',
                confirmText: 'Delete product',
                type: 'delete'})
            .then(function() {
                return sdkOrderCloud.Products.Delete(product.ID)
            })
    }

    return service;
}