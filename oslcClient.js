/** @namespace oslc */

/**
 * Represents the type of the function that is responsible to handle xml response documents
 *
 * @callback XMLJqXHRResponseCallback
 * @param {XMLDocument} responseXMLDocument - represents the XML response document.
 * @param {jqXHR} jqXHR - represents the jQuery XMLHTTPRequest object.
 *
 */

/**
 * Represents the type of the function that is responsible to handle json response objects
 *
 * @callback JSONJqXHRResponseCallback
 * @param {object} responseJSONObject - represents the JSON response object.
 * @param {jqXHR} jqXHR - represents the jQuery XMLHTTPRequest object.
 *
 */
/**
 * Represents the type of the function that is responsible to handle xml response documents
 *
 * @callback XMLResponseCallback
 * @param {XMLDocument} responseXMLDocument - represents the XML response document.
 *
 */

/**
 * Represents the type of the function that is responsible to handle json response object
 *
 * @callback JSONResponseCallback
 * @param {object} responseJSONObject - represents the JSON Object response.
 *
 */

/**
 * Represents the type of the function that is responsible to handle string responses
 *
 * @callback StringResponseCallback
 * @param {string} responseString - represents the String response
 *
 */
/**
 * Represents the type of the function that is responsible to handle errors
 *
 * @callback ErrorCallback
 * @param {jqXHR} jqXHR - represents the jQuery XMLHTTPRequest object.
 * @param {string} textStatus - represents the text status of the current jqXHR response.
 * @param {string} errorThrown - represents the error thrown by the current request.
 *
 */

(function(exports, $, undefined) {

  /**
   * Creates a new OslcQuery object
   * @constructor
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @class
   * @param {!OslcClient} oslcClient - the OslcClient associated with this Query object.
   * @param {!string} capabilityURI - represents the query capability URI @see {@link  http://open-services.net/bin/view/Main/OslcCoreSpecification#Query_Capabilities| OslcCoreSpecification#Query_Capabilities}
   * @param {number} [pageSize=0] - represents the query page size. If pageSize==0 all the results will be returned, otherwise it will be necessary to use the nextPage method.
   * @param {string} [select]- represents the select clause of the query
   * @param {string} [where]- represents the where clause of the query
   * @param {string} [orderBy] - represents the orderBy clause of the query
   * @param {string} [searchTerms] - represents the terms used in the full text search
   * @param {string} [prefix]- represents the definitions of the prefix used in the clausules of the query
   * @memberof oslc
   */
  function OslcQuery(oslcClient, capabilityURI, pageSize, select, where, orderBy, searchTerms, prefix) {
    this._oslcClient = oslcClient;
    this._capabilityURI = capabilityURI;
    if (pageSize === null) {
      this._pageSize = 0;
    } else {
      this._pageSize = pageSize;
    }

    this._where = where;
    this._select = select;
    this._orderBy = orderBy;
    this._searchTerms = searchTerms;
    this._prefix = prefix;
    this._queryResourceUrl = this._createQueryResourceUrl();
    this._queryResource = null;



  }

  /**
   * Returns the current capabilityURI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcQuery.prototype._getCapabilityURI = function() {
    return this._capabilityURI;
  };


  /**
   * Returns the current pageSize used in pagination @see {@link _getPagination}
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getPageSize = function() {
    return this._pageSize;
  };
  /**
   * Returns the current pagination params
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getPaginationParams = function() {

    if (this._getPageSize() > 0) {
      var jsonData = {};
      jsonData["oslc.paging"] = true;
      jsonData["oslc.pageSize"] = this._getPageSize();
      var queryParams = jQuery.param(jsonData);

      return queryParams;

    }
    return null;
  };

  /**
   * Returns the current oslc query params
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getOslcQueryParams = function() {
    var jsonData = {};

    if (this._where !== null && this._where.length > 0) {
      jsonData["oslc.where"] = this._where;

    }

    if (this._select !== null && this._select.length > 0) {

      jsonData["oslc.select"] = this._select;

    }

    if (this._orderBy !== null && this._orderBy.length > 0) {
      jsonData["oslc.orderBy"] = this._orderBy;

    }
    if (this._searchTerms !== null && this._searchTerms.length > 0) {
      jsonData["oslc.searchTerms"] = this._searchTerms;

    }
    if (this._prefix !== null && this._prefix.length > 0) {
      jsonData["oslc.prefix"] = this._prefix;

    }

    if (jQuery.isEmptyObject(jsonData) === false) {

      var queryParams = jQuery.param(jsonData);

      return queryParams;
    }

    return null;



  };

  /**
   * Create the query resource Url
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._createQueryResourceUrl = function() {

    var resourceUrl = this._getCapabilityURI();

    var paginationParams = this._getPaginationParams();

    var oslcQueryParams = this._getOslcQueryParams();

    var beforePaginationParams = "?";
    var beforeQueryParams = "&";

    if (paginationParams === null) {
      beforeQueryParams = "?";

    }

    if (paginationParams !== null) {
      resourceUrl += beforePaginationParams + paginationParams;

    }

    if (oslcQueryParams !== null) {
      resourceUrl += beforeQueryParams + oslcQueryParams;
    }

    return resourceUrl;
  };

  /**
   * Executes the query using the OslcClient instance
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getResponse = function(callback, onError) {
    var _self = this;

    function internalCallback(resource) {
      _self._queryResource = resource;

      callback(resource);

    }

    this._oslcClient.getResource(this._queryResourceUrl, "application/rdf+xml", false, internalCallback, onError);

  };



  /**
   * Retrives the next page of the current query results
   * @param {XMLResponseCallback} responseCallback - The callback that handles the query response.
   * @param {ErrorCallback} errorCallback - The callback that handles query errors.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcQuery.prototype.nextPage = function(responseCallback, errorCallback) {

    if (this._queryResource !== null) {
      this._queryResourceUrl = jQuery(this._queryResource).find("oslc\\:nextPage,nextPage").attr("rdf:resource");
    }
    this._getResponse(responseCallback, errorCallback);

  };


  exports.OslcQuery = OslcQuery;

})(this, jQuery);

(function(exports, $, undefined) {


  /**
   * Creates a new OslcClient object
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @constructor
   * @class
   * @param {string} [version="2.0"] - represents oslc version used in client operations
   * @memberof oslc
   */
  function OslcClient(version) {

    if (version === null) {
      this._oslcVersion = "2.0";
    } else {
      this._oslcVersion = version;
    }
  }

  /**
   * Generates the listener function responsible to execute the handle function with the results of the execution of the iframe.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._generateListenerFunction = function(handleFunction, listenerProxy, iframe, dialog) {
    var _self = this;
    return function(e) {
      var HEADER = "oslc-response:";
      if (e.source == jQuery(iframe)[0].contentWindow && e.data.indexOf(HEADER) === 0) {
        window.removeEventListener('message', listenerProxy, false);
        _self._destroyDialog(dialog);
        _self._handleMessage(e.data.substr(HEADER.length), handleFunction);
      }
    };
  };



  /**
   * Display the dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._displayDialog = function(dialog, title) {
    dialog.dialog("option", "title", title).dialog("open");
  };


  /**
   * Destroy the dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._destroyDialog = function(dialog) {
    dialog.dialog("close");
  };

  /**
   * Function responsible to process the received message and to call the handle function with the processed data.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._handleMessage = function(message, handleFunction) {

    var json = message.substring(message.indexOf("{"), message.length);

    var results = JSON.parse(json);

    if (results["oslc:results"].length > 0) {
      handleFunction(results["oslc:results"]);
    }
  };

  /**
   * Function responsible to setup the dialog used to render the iframe.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._dialogCommonHandle = function(callback, errorCallback, draftResource) {
    var _self = this;

    return function(dialogResource) {
      var dialogUrl = jQuery(dialogResource).find("oslc\\:dialog,dialog").attr("rdf:resource");

      function prepareDialog(dialogUrl) {
        var width = jQuery(dialogResource).find("oslc\\:hintWidth, hintWidth").text();
        var height = jQuery(dialogResource).find("oslc\\:hintHeight, hintHeight").text();
        width = width.replace("px", "");
        height = height.replace("px", "");

        var iframe = jQuery('<iframe id="oslc_dialog" name="oslc_dialog" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>');

        dialogUrl += '#oslc-core-postMessage-1.0';

        var dialog = jQuery("<div id='dialog'></div>").append(frame).appendTo("body").dialog({
          autoOpen: false,
          modal: true,
          resizable: false,
          width: width,
          height: height,
          bgiframe: true,
          open: function() {
            jQuery('.ui-widget-overlay').bind('click', function() {
              jQuery("#dialog").dialog("close");
              jQuery("#dialog").dialog('destroy').remove();
            });
          },
          close: function() {
            iframe.attr("src", "");
            jQuery("#dialog").dialog('destroy').remove();
          }
        });

        var src = dialogUrl;


        iframe.attr({
          width: +width,
          height: +height,
          src: src
        });

        var listenerProxy = jQuery.proxy(_self._generateListenerFunction(callback, listenerProxy, iframe, dialog), window);

        window.addEventListener('message', listenerProxy, false);

        _self._displayDialog(dialog, "OSLC Dialog");

      }

      if (typeof draftResource != 'undefined' && draftResource !== null) {
        _self.createResource(dialogUrl, draftResource, "application/rdf+xml", "*/*", function(createdResource, jqXHR) {
          var draftLocation = jqXHR.getResponseHeader("Location");
          prepareDialog(draftLocation);
        }, errorCallback);
      } else {
        prepareDialog(dialogUrl);
      }



    };

  };

  /**
   * Gets a resource
   * @param {!string} - represents the url of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the type of the returned resource
   * @param {boolean} [mustUseOslcVersionHeader=true] - this flag is necessary to correctly handle the execution of queries in a CORS environment using IBM Rational Team Concert as OSLC Provider. When a custom header is present in a CORS request (in this case OSLC-Core-Version), a preflight request is sent and RTC responds with 302 which is not allowed by the especification @see {@link http://www.w3.org/TR/cors/#resource-preflight-requests| Preflight Request}
   * @param {!(XMLJqXHRResponseCallback|JSONJqXHRResponseCallback|object)} callback - represents the callback function, the type depends of the mediaType
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.getResource = function(url, mediaType, mustUseOslcVersionHeader, callback, errorCallback) {
    var _self = this;
    if (mediaType === null) {
      mediaType = "application/rdf+xml";
    }

    jQuery.ajax({
      url: url,
      type: 'GET',
      async: true,
      cache: false,
      beforeSend: function(xhr) {

        xhr.setRequestHeader('Accept', mediaType);
        if (mustUseOslcVersionHeader === null || mustUseOslcVersionHeader === true) {

          xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
        }
      },
      accepts: mediaType,
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {

        callback(data, jqXHR);
      },
      error: function(jqXHR, textStatus, errorThrown) {

        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };



  /**
   * Creates a resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the url to POST the resource
   * @param {!(XMLDocument|object)} - represents the data of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the data type of the submitted resource
   * @param {string} [acceptType="application/rdf+xml"] - represents the data type of the returned resource
   * @param {!(XMLJqXHRResponseCallback|JSONJqXHRResponseCallback|object)} callback - represents the callback function, the type depends of the mediaType
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.createResource = function(url, resource, mediaType, acceptType, callback, errorCallback) {
    var _self = this;
    if (mediaType === null) {
      mediaType = "application/rdf+xml";
    }

    if (acceptType === null) {
      acceptType = "application/rdf+xml";
    }

    jQuery.ajax({
      url: url,
      type: 'POST',
      async: true,
      accepts: acceptType,
      data: resource,
      cache: true,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Accept', acceptType);
        xhr.setRequestHeader('Content-Type', mediaType);
        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
        //necessary to create resources with IBM RTC.
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {
        callback(data, jqXHR);
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };

  /**
   * Updates a resource
   * @param {!string} - represents the url of the resource to update
   * @param {!(XMLDocument|object)} - represents the data of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the data type of the submitted resource update
   * @param {string} [acceptType="application/rdf+xml"] - represents the data type of the returned resource update
   * @param {ifMatch} - represents the ifMatch header
   * @param {!(XMLResponseCallback|JSONResponseCallback|object)} callback - represents the callback function, the type depends of the mediaType
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.updateResource = function(url, resource, mediaType, acceptType, ifMatch, callback, errorCallback) {
    var _self = this;
    if (mediaType === null) {
      mediaType = "application/rdf+xml";
    }

    if (acceptType === null) {
      acceptType = "application/rdf+xml";
    }

    jQuery.ajax({
      url: url,
      type: 'PUT',
      async: true,
      accepts: acceptType,
      data: resource,
      cache: false,
      beforeSend: function(xhr) {
        if (ifMatch !== null) {
          xhr.setRequestHeader('If-Match', ifMatch);
        }

        xhr.setRequestHeader('Accept', acceptType);
        xhr.setRequestHeader('Content-Type', mediaType);
        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {

        callback(data);
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };
  /**
   * Deletes a resource
   * @param {!string} - represents the url of the resource to delete
   * @param {!(XMLResponseCallback|JSONResponseCallback|object)} callback - represents the callback function, the type depends of the mediaType
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.deleteResource = function(url, callback, errorCallback) {
    var _self = this;

    jQuery.ajax({
      url: url,
      type: 'DELETE',
      async: true,
      cache: false,
      beforeSend: function(xhr) {

        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
      },
      xhrFields: {
        withCredentials: true
      },

      success: function(data, textStatus, jqXHR) {
        callback(data);
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };

  /**
   * Lookup Service Provider Url by its title
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the catalogUrl to search the service provider url
   * @param {!string} - represents the service provider title to search for
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupServiceProviderUrl = function(catalogUrl, serviceProviderTitle, callback, errorCallback) {

    function internalCallBack(data, textStatus, jqXHR) {
      var xmlString = (new XMLSerializer()).serializeToString(data);
      jQuery(data).find("oslc\\:ServiceProviderCatalog > oslc\\:serviceProvider > oslc\\:ServiceProvider > dcterms\\:title, ServiceProviderCatalog > serviceProvider > ServiceProvider > title").each(function() {
        var currentServiceProviderTitle = jQuery(this).text();

        if (currentServiceProviderTitle == serviceProviderTitle) {

          callback(jQuery(this).parent().attr("rdf:about"));
        }
      });
    }

    this.getResource(catalogUrl, "application/rdf+xml", true, internalCallBack, errorCallback);



  };

  /**
   * Lookup Creation Dialog Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the dialog
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationDialogResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {

    function internalCallBack(data, textStatus, jqXHR) {
      var firstCreationDialog = null;
      var creationDialog = null;

      var defaultCreationDialog = null;
      jQuery(data).find("oslc\\:ServiceProvider > oslc\\:service > oslc\\:Service, ServiceProvider > service > Service").each(function() {

        jQuery(this).find("oslc\\:domain,domain").each(function() {
          var first = true;

          var currentDomain = jQuery(this).attr("rdf:resource");

          if (currentDomain !== null && currentDomain == oslcDomain) {

            jQuery(this).parent().find("oslc\\:creationDialog > oslc\\:Dialog , creationDialog > Dialog").each(function() {

              var curr = jQuery(this);
              if (first === true) {
                first = false;
                firstCreationDialog = curr;

              }

              jQuery(this).find("oslc\\:resourceType,resourceType").each(function() {

                var currentResourceType = jQuery(this).attr("rdf:resource");

                if (currentResourceType !== null && currentResourceType == oslcResourceType) {
                  creationDialog = curr;
                }

              });

              jQuery(this).find("oslc\\:usage,usage").each(function() {
                var currentUsage = jQuery(this).attr("rdf:resource");

                if (currentUsage !== null && currentUsage == "http://open-services.net/ns/core#default") {
                  defaultCreationDialog = curr;
                }

              });

            });

          }
        });
      });

      if (creationDialog !== null) {
        callback(creationDialog);
      } else if (defaultCreationDialog !== null) {
        callback(defaultCreationDialog);
      } else if (firstCreationDialog !== null) {

        var size = firstCreationDialog.find("oslc\\:resourceType,resourceType").length;

        if (size === 0) {
          callback(firstCreationDialog);
        }

      }
    }
    this.getResource(serviceProviderUrl, "application/rdf+xml", true, internalCallBack, errorCallback);

  };


  /**
   * Lookup Selection Dialog Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the dialog
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupSelectionDialogResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {

    function internalCallBack(data, textStatus, jqXHR) {
      var firstSelectionDialog = null;
      var selectionDialog = null;

      var defaultSelectionDialog = null;
      jQuery(data).find("oslc\\:ServiceProvider > oslc\\:service > oslc\\:Service, ServiceProvider > service > Service").each(function() {

        jQuery(this).find("oslc\\:domain,domain").each(function() {
          var first = true;

          var currentDomain = jQuery(this).attr("rdf:resource");

          if (currentDomain !== null && currentDomain == oslcDomain) {

            jQuery(this).parent().find("oslc\\:selectionDialog > oslc\\:Dialog , selectionDialog > Dialog").each(function() {

              var curr = jQuery(this);
              if (first === true) {
                first = false;
                firstSelectionDialog = curr;

              }

              jQuery(this).find("oslc\\:resourceType,resourceType").each(function() {

                var currentResourceType = jQuery(this).attr("rdf:resource");

                if (currentResourceType !== null && currentResourceType == oslcResourceType) {


                  selectionDialog = curr;
                }

              });

              jQuery(this).find("oslc\\:usage,usage").each(function() {
                var currentUsage = jQuery(this).attr("rdf:resource");

                if (currentUsage !== null && currentUsage == "http://open-services.net/ns/core#default") {

                  defaultSelectionDialog = curr;
                }

              });

            });

          }
        });
      });

      if (selectionDialog !== null) {

        callback(selectionDialog);

      } else if (defaultSelectionDialog !== null) {
        callback(defaultSelectionDialog);
      } else if (firstSelectionDialog !== null) {

        var size = firstSelectionDialog.find("oslc\\:resourceType,resourceType").length;

        if (size === 0) {
          callback(firstSelectionDialog);
        }

      }
    }
    this.getResource(serviceProviderUrl, "application/rdf+xml", true, internalCallBack, errorCallback);

  };

  /**
   * Lookup Query Capability URI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the query capability URI
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupQueryCapabilityURI = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {

    function internalCallBack(data, textStatus, jqXHR) {
      var firstQueryCapability = null;
      var queryCapability = null;

      var defaultQueryCapability = null;
      jQuery(data).find("oslc\\:ServiceProvider > oslc\\:service > oslc\\:Service, ServiceProvider > service > Service").each(function() {

        jQuery(this).find("oslc\\:domain,domain").each(function() {
          var first = true;

          var currentDomain = jQuery(this).attr("rdf:resource");

          if (currentDomain !== null && currentDomain == oslcDomain) {

            jQuery(this).parent().find("oslc\\:queryCapability > oslc\\:QueryCapability , queryCapability > QueryCapability").each(function() {

              var curr = jQuery(this).find("oslc\\:queryBase, queryBase").attr("rdf:resource");
              if (first === true) {
                first = false;
                firstQueryCapability = curr;

              }

              jQuery(this).find("oslc\\:resourceType,resourceType").each(function() {

                var currentResourceType = jQuery(this).attr("rdf:resource");

                if (currentResourceType !== null && currentResourceType == oslcResourceType) {
                  queryCapability = curr;
                }

              });

              jQuery(this).find("oslc\\:usage,usage").each(function() {
                var currentUsage = jQuery(this).attr("rdf:resource");

                if (currentUsage !== null && currentUsage == "http://open-services.net/ns/core#default") {

                  defaultQueryCapability = curr;
                }

              });

            });

          }
        });
      });

      if (queryCapability !== null) {
        callback(queryCapability);
      } else if (defaultQueryCapability !== null) {
        callback(defaultQueryCapability);
      } else if (firstQueryCapability !== null) {

        var size = firstQueryCapability.find("oslc\\:resourceType,resourceType").length;

        if (size === 0) {
          callback(firstQueryCapability);
        }

      }
    }
    this.getResource(serviceProviderUrl, "application/rdf+xml", true, internalCallBack, errorCallback);

  };

  /**
   * Lookup Creation Factory Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the creation factory
   * @param {string} [oslcUsage] - represents the oslc usage associated with the creation factory
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationFactoryResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, callback, errorCallback) {

    function internalCallBack(data, textStatus, jqXHR) {

      var firstCreationFactory = null;
      var creationFactory = null;

      var defaultCreationFactory = null;
      jQuery(data).find("oslc\\:ServiceProvider > oslc\\:service > oslc\\:Service, ServiceProvider > service > Service").each(function() {

        jQuery(this).find("oslc\\:domain,domain").each(function() {
          var first = true;

          var currentDomain = jQuery(this).attr("rdf:resource");

          if (currentDomain !== null && currentDomain == oslcDomain) {

            jQuery(this).parent().find("oslc\\:creationFactory > oslc\\:CreationFactory , creationFactory > CreationFactory").each(function() {

              var curr = jQuery(this);
              if (first === true) {
                first = false;
                firstCreationFactory = jQuery(this);
              }

              jQuery(this).find("oslc\\:resourceType,resourceType").each(function() {

                var currentResourceType = jQuery(this).attr("rdf:resource");

                if (currentResourceType !== null && currentResourceType == oslcResourceType) {

                  if (oslcUsage !== null) {

                    jQuery(this).parent().find("oslc\\:usage,usage").each(function() {
                      var currentUsage = jQuery(this).attr("rdf:resource");

                      if (currentUsage !== null && currentUsage == oslcUsage) {

                        creationFactory = curr;
                      }
                    });

                  } else {
                    creationFactory = curr;

                  }
                }

              });

              jQuery(this).find("oslc\\:usage,usage").each(function() {
                var currentUsage = jQuery(this).attr("rdf:resource");

                if (currentUsage !== null && currentUsage == "http://open-services.net/ns/core#default") {
                  defaultCreationFactory = curr;
                }

              });

            });

          }
        });
      });

      if (creationFactory !== null) {

        callback(creationFactory);

      } else if (defaultCreationFactory !== null) {
        callback(defaultCreationFactory);
      } else if (firstCreationFactory !== null) {

        var size = firstCreationFactory.find("oslc\\:resourceType,resourceType").length;

        if (size === 0) {
          callback(firstCreationFactory);
        }

      }
    }
    this.getResource(serviceProviderUrl, "application/rdf+xml", true, internalCallBack, errorCallback);

  };


  /**
   * Lookup Creation Factory Resource URI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the creation factory
   * @param {string} [oslcUsage] - represents the oslc usage associated with the creation factory
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationFactoryURI = function(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, callback, errorCallback) {

    function internalCallBack(creationFactoryResource) {
      if (creationFactoryResource !== null) {

        var url = creationFactoryResource.find("oslc\\:creation,creation").attr("rdf:resource");

        callback(url);
      }
    }
    this.lookupCreationFactoryResource(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, internalCallBack, errorCallback);

  };


  /**
   * Open the Selection Dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the selection dialog
   * @param {!JSONResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.openSelectionDialog = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, onError) {
    this.lookupSelectionDialogResource(serviceProviderUrl, oslcDomain, oslcResourceType, this._dialogCommonHandle(callback, onError, null), onError);
  };

  /**
   * Open the Creation Dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the selection dialog
   * @param {XMLDocument} [drafResource] - represents the draft resource used to populate the dialog
   * @param {!JSONResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.openCreationDialog = function(serviceProviderUrl, oslcDomain, oslcResourceType, draftResource, callback, onError) {
    this.lookupCreationDialogResource(serviceProviderUrl, oslcDomain, oslcResourceType, this._dialogCommonHandle(callback, onError, draftResource), onError);
  };

  exports.OslcClient = OslcClient;
})(this, jQuery);