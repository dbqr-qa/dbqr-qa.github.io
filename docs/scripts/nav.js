var menuModalVisible = false;

const toggleMenu = () => {
    const modal = $('.nav.modal');

    if (menuModalVisible) {
        modal.fadeOut('fast');
        menuModalVisible = false;

    } else {
        modal.fadeIn('fast');
        menuModalVisible = true;
    }
}

$(document).ready(function() {
    const desktop = $('.nav.desktop').html();
    const div = $(desktop)
    const modal = $('.nav.modal .container');

    modal.append(div);

    $('#menu').on('click', toggleMenu);
});
