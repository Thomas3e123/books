import os

from selenium import webdriver
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.client_config import ClientConfig
from selenium.webdriver.support import expected_conditions as conditions
from selenium.webdriver.support.ui import WebDriverWait


def tap(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block:'nearest'})", element)
    actions = ActionBuilder(driver, mouse=PointerInput("touch", "finger"))
    actions.pointer_action.move_to(element)
    actions.pointer_action.pointer_down()
    actions.pointer_action.release()
    actions.perform()


def main():
    origin = "https://gravityleadershipsystem.com"
    hub = "https://hub-cloud.browserstack.com/wd/hub"
    connection = ClientConfig(
        remote_server_addr=hub,
        username=os.environ["BROWSERSTACK_USERNAME"],
        password=os.environ["BROWSERSTACK_ACCESS_KEY"],
        timeout=90,
    )
    options = webdriver.ChromeOptions()
    options.set_capability("platformName", "Android")
    options.set_capability("bstack:options", {
        "deviceName": "Samsung Galaxy S23 Ultra",
        "osVersion": "13.0",
        "realMobile": True,
        "idleTimeout": 60,
        "sessionName": "Gravity homepage and menu",
    })
    with webdriver.Remote(command_executor=hub, options=options, client_config=connection) as driver:
        wait = WebDriverWait(driver, 15)
        driver.set_page_load_timeout(35)
        driver.get(origin + "/")
        toggle = (By.CSS_SELECTOR, "header.site-header[data-menu-ready] [data-menu-toggle]")
        wait.until(conditions.element_to_be_clickable(toggle))
        guide = driver.find_element(By.ID, "gravity-first-visit")
        assert not guide.is_displayed(), "The guide covered the homepage on arrival"
        for path in ("/books", "/help-center"):
            button = wait.until(conditions.element_to_be_clickable(toggle))
            tap(driver, button)
            wait.until(lambda _: button.get_attribute("aria-expanded") == "true")
            link = (By.CSS_SELECTOR, f'#site-nav a[href="{path}"]')
            tap(driver, wait.until(conditions.element_to_be_clickable(link)))
            wait.until(conditions.url_to_be(origin + path))
            print(f"Real Android touch navigation passed: {path}", flush=True)


if __name__ == "__main__":
    main()
