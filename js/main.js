(function($) {

    var defaultProfiles = {
        'current': 'Default Profile',
        'ds2_profiles': {
            'Default Profile': {
                checklistData: {}
            }
        }
    };
    var profiles = $.jStorage.get('ds2_profiles', defaultProfiles);

    jQuery(document).ready(function($) {

        // TODO Find a better way to do this in one pass
        $('ul li li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });
        $('ul li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });

        populateProfiles();

        $('input[type="checkbox"]').click(function() {
            var id = $(this).attr('id');
            var isChecked = profiles.ds2_profiles[profiles.current].checklistData[id] = $(this).prop('checked');
            //_gaq.push(['_trackEvent', 'Checkbox', (isChecked ? 'Check' : 'Uncheck'), id]);
            $(this).parent().parent().find('li > label > input[type="checkbox"]').each(function() {
                var id = $(this).attr('id');
                profiles.ds2_profiles[profiles.current].checklistData[id] = isChecked;
                $(this).prop('checked', isChecked);
            });
            $.jStorage.set('ds2_profiles', profiles);
            calculateTotals();
        });

        $('#profiles').change(function(event) {
            profiles.current = $(this).val();
            $.jStorage.set('ds2_profiles', profiles);
            populateChecklists();
            //_gaq.push(['_trackEvent', 'Profile', 'Change', profiles.current]);
        });

        $('#profileAdd').click(function() {
            $('#profileModalTitle').html('Add Profile');
            $('#profileModalName').val('');
            $('#profileModalAdd').show();
            $('#profileModalUpdate').hide();
            $('#profileModalDelete').hide();
            $('#profileModal').modal('show');
            //_gaq.push(['_trackEvent', 'Profile', 'Add']);
        });

        $('#profileEdit').click(function() {
            $('#profileModalTitle').html('Edit Profile');
            $('#profileModalName').val(profiles.current);
            $('#profileModalAdd').hide();
            $('#profileModalUpdate').show();
            if (canDelete()) {
                $('#profileModalDelete').show();
            } else {
                $('#profileModalDelete').hide();
            }
            $('#profileModal').modal('show');
            //_gaq.push(['_trackEvent', 'Profile', 'Edit', profiles.current]);
        });

        $('#profileModalAdd').click(function(event) {
            event.preventDefault();
            var profile = $.trim($('#profileModalName').val());
            if (profile.length > 0) {
                if (typeof profiles.ds2_profiles[profile] == 'undefined') {
                    profiles.ds2_profiles[profile] = { checklistData: {} };
                }
                profiles.current = profile;
                $.jStorage.set('ds2_profiles', profiles);
                populateProfiles();
                populateChecklists();
            }
            $('#profileModal').modal('hide');
            //_gaq.push(['_trackEvent', 'Profile', 'Create', profile]);
        });

        $('#profileModalUpdate').click(function(event) {
            event.preventDefault();
            var newName = $.trim($('#profileModalName').val());
            if (newName.length > 0 && newName != profiles.current) {
                profiles.ds2_profiles[newName] = profiles.ds2_profiles[profiles.current];
                delete profiles.ds2_profiles[profiles.current];
                profiles.current = newName;
                $.jStorage.set('ds2_profiles', profiles);
                populateProfiles();
            }
            $('#profileModal').modal('hide');
            //_gaq.push(['_trackEvent', 'Profile', 'Update', profile]);
        });

        $('#profileModalDelete').click(function(event) {
            event.preventDefault();
            if (!canDelete()) {
                return;
            }
            if (!confirm('Are you sure?')) {
                return;
            }
            delete profiles.ds2_profiles[profiles.current];
            profiles.current = getFirstProfile();
            $.jStorage.set('ds2_profiles', profiles);
            populateProfiles();
            populateChecklists();
            $('#profileModal').modal('hide');
            //_gaq.push(['_trackEvent', 'Profile', 'Delete']);
        });

        $('#profileModalClose').click(function(event) {
            event.preventDefault();
            $('#profileModal').modal('hide');
            //_gaq.push(['_trackEvent', 'Profile', 'Close']);
        });

        calculateTotals();

    });

    function populateProfiles() {
        $('#profiles').empty();
        $.each(profiles.ds2_profiles, function(index, value) {
            $('#profiles').append($("<option></option>").attr('value', index).text(index));
        });
        $('#profiles').val(profiles.current);
    }

    function populateChecklists() {
        $('input[type="checkbox"]').prop('checked', false);
        $.each(profiles.ds2_profiles[profiles.current].checklistData, function(index, value) {
            $('#' + index).prop('checked', value);
        });
        calculateTotals();
    }

    function calculateTotals() {
        var overallCount = 0, overallChecked = 0;
        for (var i = 1; i <= 34; i++)  {
            var totals = $('.totals_' + i);
            if (totals.length == 0) {
                continue;
            }
            var count = 0, checked = 0;
            for (var j = 1; ; j++) {
                var checkbox = $('#playthrough_' + i + '_' + j);
                if (checkbox.length == 0) {
                    break;
                }
                count++;
                overallCount++;
                if (checkbox.prop('checked')) {
                    checked++;
                    overallChecked++;
                }
            }
            $(totals).each(function(index) {
                this.innerHTML = '[' + checked + '/' + count + ']';
                if (checked == count) {
                    $(this).removeClass('in_progress').addClass('done');
                } else {
                    $(this).removeClass('done').addClass('in_progress');
                }
            });
        }
        $('#totals')[0].innerHTML = '[' + overallChecked + '/' + overallCount + ']';
        if (overallChecked == overallCount) {
            $('#totals').removeClass('in_progress').addClass('done');
        } else {
            $('#totals').removeClass('done').addClass('in_progress');
        }
    }

    function addCheckbox(el) {
        var lines = $(el).html().split('\n');
        lines[0] = '<label class="checkbox"><input type="checkbox" id="' + $(el).attr('data-id') + '">' + lines[0] + '</label>';
        $(el).html(lines.join('\n'));
        if (profiles.ds2_profiles[profiles.current].checklistData[$(el).attr('data-id')] == true) {
            $('#' + $(el).attr('data-id')).prop('checked', true);
        }
    }

    function canDelete() {
        var count = 0;
        $.each(profiles.ds2_profiles, function(index, value) {
            count++;
        });
        return (count > 1);
    }

    function getFirstProfile() {
        for (var profile in profiles.ds2_profiles) {
            return profile;
        }
    }

})( jQuery );
